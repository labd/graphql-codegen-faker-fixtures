import {
  ASTNode,
  DocumentNode,
  EnumTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  Kind,
  ListTypeNode,
  NamedTypeNode,
  NonNullTypeNode,
  ObjectTypeDefinitionNode,
  parse,
  printSchema,
  SelectionSetNode,
  UnionTypeDefinitionNode,
  visit,
} from "graphql";
import {
  Enum,
  Field,
  Fragment,
  FragmentField,
  Union,
  Plugin,
  PluginConfig,
  ScalarsConfig,
} from "./types";

// This plugin was generated with the help of ast explorer.
// https://astexplorer.net
// Paste your graphql schema in it, and you'll be able to see what the `astNode` will look like
// The tool is awesome, you should check it out :-)
// Pro-tip: play around with some TypeScript-code too!

/**
 * The entry-point called from graphql-codegen
 *
 * This plugin works in three steps:
 *
 * 1. Collect all data-types on all fields defined in graphql Types/Interfaces
 * 2. Collect all fields defined in Fragments, and map them against the collected fields in step-1.
 * 3. Write typescript based on gathered info in step 2.
 *
 */
export const plugin: Plugin = (
  schema,
  documents,
  { typeImport, skipFragments, skipFields, buildersOnly, fakerjsSeed, scalars },
) => {
  // -------------------------------------------
  // We define some helpers and imports.
  // -------------------------------------------

  const disclaimer = `
    /* NOTE: This file is auto-generated. DO NOT EDIT. */
  `;

  const imports = [
    `import * as types from '${typeImport || "CONFIGURE_TYPE_IMPORT"}';`,
    `import { deepmergeCustom } from 'deepmerge-ts'`,
    `import { faker } from '@faker-js/faker';`,
  ].join("\n");

  const utils = `
      export type DeepPartial<T> = T extends object
        ? { [P in keyof T]?: DeepPartial<T[P]> }
        : T

      export const repeat = <T>(numTimes: number, callback: (i: number) => T) =>
        Array.from(Array(numTimes).keys()).map((i) => callback(i))

      const deepmerge = deepmergeCustom({ mergeArrays: false })
      export const merge = <T>(fixture: T, override: unknown) =>
        deepmerge(fixture, override) as T

      export const random = (min: number, max: number) => faker.number.int({ min, max })

      faker.seed(${fakerjsSeed || 12345654321})
  `;

  // Parse the schema into a `DocumentNode` we're able to parse.
  // The schema includes all Graphql-types but does NOT contain any fragments
  // Have a look at https://astexplorer.net to see what the DocumentNode looks like.
  const astSchema = parse(printSchema(schema));

  // Make an array of all given documents.
  // The documents contain all the fragments, but do NOT contain any graphql-types.
  const documentNodes = documents
    .map((document) => document.document)
    .filter(Boolean) as DocumentNode[];

  // Collect enums, fields, and unions from schema.
  // We use them to look up the types defined in the fragments.
  const { enums, fields, unions } = collectFromSchema(astSchema);

  // Collect all fragments (and its fields) in a flat-array.
  const fragments = documentNodes.flatMap((documentNode) =>
    collectFragments(documentNode, fields),
  );

  // Create all fragment-builders using the information we have collected earlier.
  const code = fragments
    .filter((fragment) => !skipFragments?.includes(fragment.fragmentName))
    .map((fragment) =>
      createFragmentBuilder(fragment, enums, unions, skipFields, scalars),
    )
    .join("\n");

  // Combine all the things in a nice prettified file
  const parts = buildersOnly ? [code] : [disclaimer, imports, utils, code];
  return parts.join("\n\n");
};

/**
 * Collect all fields, enums, unions from the Schema.
 * Note: the Schema does NOT contain any fragments.
 */
const collectFromSchema = (
  astNode: ASTNode,
): { fields: Field[]; enums: Enum[]; unions: Union[] } => {
  // Setup arrays, we push everything we find along the way in them.
  const fields: Field[] = [];
  const enums: Enum[] = [];
  const unions: Union[] = [];

  // ObjectType and InterfaceTypes are so similar they can use the same visitFn
  const visitObjectTypeOrInterfaceType = (
    node: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode,
  ) => {
    const objectName = node.name.value;

    node?.fields?.forEach((field) => {
      const fieldName = field.name.value;
      const fieldType = collectFieldType(field.type);

      const isArray =
        field.type.kind === Kind.NON_NULL_TYPE
          ? field.type.type.kind === Kind.LIST_TYPE
          : field.type.kind === Kind.LIST_TYPE;

      fields.push({
        objectName,
        fieldType,
        fieldName,
        isArray,
      });
    });
  };

  // Visit the astNode-tree using the visit-method provided by graphql-codegen
  visit(astNode, {
    EnumTypeDefinition: {
      leave: (node: EnumTypeDefinitionNode) => {
        const enumName = node.name.value;
        const enumValues = node?.values?.map((value) => value.name.value) || [];
        enums.push({ enumName, enumValues });
      },
    },
    // Gets called every time the visitor visits an UnionTypeDefinition
    UnionTypeDefinition: {
      leave: (node: UnionTypeDefinitionNode) => {
        const unionName = node.name.value;
        const unionValues =
          node.types?.map((namedTypeNode) => namedTypeNode.name.value) || [];

        unions.push({ unionName, unionValues });
      },
    },
    // Gets called every time the visitor visits an ObjectTypeDefinition
    ObjectTypeDefinition: {
      leave: visitObjectTypeOrInterfaceType,
    },
    // Gets called every time the visitor visits an InterfaceTypeDefinition
    InterfaceTypeDefinition: {
      leave: visitObjectTypeOrInterfaceType,
    },
  });

  return { fields, enums, unions };
};

/**
 * Collect the actual FieldType, as node could be wrapped with a NON_NULL_TYPE or LIST_TYPE (or both).
 * E.g: String!, [String], [String!], [String!]!
 *
 * We're only interested in the type being a string.
 */
const collectFieldType = (
  node: NonNullTypeNode | ListTypeNode | NamedTypeNode,
): string => {
  if (node.kind === Kind.NON_NULL_TYPE || node.kind === Kind.LIST_TYPE) {
    // ...nope, not interesting yet. Let's dig deeper.
    return collectFieldType(node.type);
  }
  return node.name.value;
};

/**
 * Collect all Fragments from a document
 */
const collectFragments = (
  astNode: ASTNode,
  collectedFields: Field[],
): Fragment[] => {
  const fragments: Fragment[] = [];

  const collectFieldsInFragment = (
    node: SelectionSetNode,
    objectName: string,
  ) => {
    const fields: FragmentField[] = [];

    node.selections.map((selection) => {
      if (selection.kind === Kind.FIELD) {
        // ... we have encountered a 'regular' field.
        const fieldName = selection.name.value;

        const collectedField: Field | undefined =
          fieldName === "__typename"
            ? // We have encountered a '__typename' field.
            // These are special as they should have a hardcoded value: objectName
            {
              fieldType: "__typename",
              fieldName: "__typename",
              objectName: objectName,
            }
            : // field was not a __typename.
            // Let's see if we can find the Field we have collected earlier.
            // It should contain more info on its type.
            collectedFields.find(
              (collectedField) =>
                collectedField.objectName === objectName &&
                collectedField.fieldName === fieldName,
            );

        if (!collectedField) {
          throw new Error(
            `Could not find type for field ${fieldName} in fragment for ${objectName}`,
          );
        }

        // Important: clone (!) collectedField into fragmentField.
        // We want to make sure this fragment does not 'mess' with fields for other fragments.
        let field: FragmentField = { ...collectedField };

        // Was field aliased in fragment?
        // If so: use the alias as fieldName in the builder.
        const fieldAlias = selection.alias?.value;
        if (fieldAlias) {
          field = { ...field, fieldName: fieldAlias };
        }

        // Field has subfields. Let's recursively find them.
        if (selection.selectionSet) {
          field = {
            ...field,
            fields: collectFieldsInFragment(
              selection.selectionSet,
              field.fieldType,
            ),
          };
        }

        fields.push(field);
      } else if (selection.kind === Kind.FRAGMENT_SPREAD) {
        // Have a look at `./tests/fragment_spread.test.ts` to see what a FRAGMENT_SPREAD is
        fields.push({
          spreadName: selection.name.value,
          isSpread: true,
          fieldName: "",
          fieldType: "",
          objectName: "",
        });
      } else if (selection.kind === Kind.INLINE_FRAGMENT) {
        // Have a look at `./tests/inline_fragment.test.ts` to see what a INLINE_FRAGMENT is
        const objectName = selection.typeCondition?.name.value || "";
        fields.push({
          fieldName: "",
          fieldType: "",
          objectName: objectName,
          isSpread: true,
          fields: collectFieldsInFragment(selection.selectionSet, objectName),
        });
      }
    });

    return fields;
  };

  visit(astNode, {
    FragmentDefinition: {
      leave: (node) => {
        const fragmentName = node.name.value;
        const objectName = node.typeCondition.name.value;
        const fields = collectFieldsInFragment(node.selectionSet, objectName);
        fragments.push({ fragmentName, objectName, fields });
      },
    },
  });

  return fragments;
};

/**
 * Creates a PascalCased fragmentName. E.g.  "productCategory" becomes ProductCategory
 */
const toPascalCase = (fragmentName: string) =>
  fragmentName[0].toUpperCase() + fragmentName.slice(1);

/**
 * Creates the actual fragment-factory
 */
const createFragmentBuilder = (
  fragment: Fragment,
  enums: Enum[],
  unions: Union[],
  skipFields?: string[],
  scalars?: PluginConfig["scalars"],
) => {
  const name = fragment.fragmentName;
  const pascalCased = toPascalCase(name);
  const typeName = `types.${pascalCased}Fragment`;
  const partialTypeName = `DeepPartial<${typeName}>`;

  const isUnion = unions.some(
    (union) => union.unionName === fragment.objectName,
  );

  if (isUnion) {
    return `
      export const fake${pascalCased} = ():${typeName} =>
        faker.helpers.arrayElement([
          ${fragment.fields
        .filter((field) => field.spreadName)
        .map((field) => toPascalCase(field.spreadName || ""))
        .map((pascalCased) => `fake${pascalCased}()`)
        .join(",")}
        ])
    `;
  }

  return `
    export const fake${pascalCased} = (override?:${partialTypeName}):${typeName} => {
      const fixture:${typeName} = {
        ${createFakerFields(
    fragment.fields,
    enums,
    pascalCased,
    skipFields,
    scalars,
  )}
      }

      return override
        ? merge(fixture, override)
        : fixture
    }
  `;
};

/**
 * Creates the fields within a fixture object.
 */
const createFakerFields = (
  fields: FragmentField[],
  enums: Enum[],
  pascalCased: string,
  skipFields?: string[],
  scalars?: PluginConfig["scalars"],
) => {
  const shouldSkipField = (fieldName: string) =>
    skipFields?.includes(`${pascalCased}Fragment.${fieldName}`);

  // We deal with spreads and nonSpreads separately
  const nonSpreads = fields.filter((field) => !field.isSpread);
  const spreads = fields.filter((field) => field.isSpread);

  const nonSpreadString = nonSpreads
    .filter((field) => !shouldSkipField(field.fieldName))
    .map((field) =>
      createFakerValue(field, enums, pascalCased, skipFields, scalars),
    )
    .join(",");

  const spreadValues = spreads
    .filter((field) => !shouldSkipField(field.fieldName))
    .map((field) =>
      createFakerValue(field, enums, pascalCased, skipFields, scalars),
    );

  let spreadString: string = "";

  if (spreadValues.length === 1) {
    spreadString = `...${spreadValues[0]}`;
  } else if (spreadValues.length > 1) {
    spreadString = `...faker.helpers.arrayElement([${spreadValues.join(",")}])`;
  }

  return [nonSpreadString, spreadString].filter(Boolean).join(",");
};

/**
 * Creates a 'row' in the fixture object.
 */
const createFakerValue = (
  field: FragmentField,
  enums: Enum[],
  pascalCased: string,
  skipFields?: string[],
  scalars?: PluginConfig["scalars"],
): string => {
  if (field.fieldName === "__typename") {
    return `__typename: '${field.objectName}'`;
  }

  const prefix = field.isArray ? "repeat(random(1 , 5), () => (" : "";
  const suffix = field.isArray ? "))" : "";

  if (field.spreadName) {
    // Field was a named spread:
    const fragmentName = toPascalCase(field.spreadName);
    return `${prefix}fake${fragmentName}()${suffix}`;
  }

  if (field.fields && field.isSpread && !field.spreadName) {
    // Field was an inline-spread:
    // Recursively go back to createFakerFields to render its subfields:
    const subFields = createFakerFields(
      field.fields,
      enums,
      pascalCased,
      skipFields,
    );
    return `${prefix}{${subFields}}${suffix}`;
  }

  if (field.fields) {
    // Field has subfields:
    if (field.fields.length === 0) {
      throw new Error("Field should have subFields");
    }

    // Recursively go back to createFakerFields to render the subfields:
    const subFields = createFakerFields(
      field.fields,
      enums,
      pascalCased,
      skipFields,
    );

    return `${field.fieldName}: ${prefix}{ ${subFields} }${suffix}`;
  }

  // Field was a Scalar field:
  const fakerMethod = createFakerMethod(field, enums, scalars);
  if (fakerMethod) {
    return `${field.fieldName}: ${prefix}${fakerMethod}${suffix}`;
  }

  return "";
};

const findFakerMethodOfScalar = (
  scalar: string,
  defaultMethod: string,
  field: Field,
  config?: ScalarsConfig,
) => {
  const scalarConfig = config?.[scalar];
  const defaultFieldMethod = config?.[scalar]?._default || defaultMethod;

  if (!scalarConfig) {
    return defaultFieldMethod;
  }

  if (`${field.objectName}.${field.fieldName}` in scalarConfig) {
    if (
      typeof scalarConfig[`${field.objectName}.${field.fieldName}`] !== "string"
    ) {
      throw Error(
        `Configuration error: value of ${field.objectName}.${field.fieldName} in ${scalar} is not of type "string".`,
      );
    }
    return scalarConfig[`${field.objectName}.${field.fieldName}`];
  }

  if (field.fieldName in scalarConfig) {
    if (typeof scalarConfig[field.fieldName] !== "string") {
      throw Error(
        `Configuration error: value of ${field.fieldName} in ${scalar} is not of type "string".`,
      );
    }
    return scalarConfig[field.fieldName];
  }

  return defaultFieldMethod;
};

const findFieldAsExistingEnum = (field: Field, enums: Enum[]) => {
  return enums.find((myEnum) => myEnum.enumName === field.fieldType);
};

const findDefaultFakerMethodForScalar = (scalar: string) => {
  switch (scalar) {
    case "Int":
      return "faker.number.int()";
    case "Float":
      return "faker.number.float()";
    case "Boolean":
      return "faker.datatype.boolean()";
    case "ID":
      return "faker.string.uuid()";
    case "String":
    default:
      return "faker.lorem.words()";
  }
};

// prettier-ignore
const createFakerMethod = (field: Field, enums: Enum[], scalars?: ScalarsConfig) => {
  const myEnum = findFieldAsExistingEnum(field, enums)

  if (myEnum) {
    return `faker.helpers.arrayElement(${JSON.stringify(myEnum.enumValues)})`
  } else {
    return findFakerMethodOfScalar(field.fieldType, findDefaultFakerMethodForScalar(field.fieldType), field, scalars);
  }
}
