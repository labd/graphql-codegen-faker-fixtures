import { CodegenConfig as DefaultCodegenConfig } from "@graphql-codegen/cli";
import { PluginFunction } from "@graphql-codegen/plugin-helpers";

const scalars = ["Boolean", "Float", "ID", "Int", "String"] as const;
type Scalar = (typeof scalars)[number];

export type ScalarsConfig = Partial<
  Record<Scalar, Record<string, string> & { _default?: string }>
>;

/**
 * Config is being set through the config property in codegen.yml
 */
type PluginConfig = {
  /**
   * When true: plugin returns the builders-only, and skips disclaimer, utils, etc.
   * Very useful when (unit-)testing this plugin
   */
  buildersOnly?: boolean;
  /**
   * Choose a custom seed to use in `faker.seed()`
   * Default: 12345654321
   */
  fakerjsSeed?: number;
  /**
   * Where do we import the types from?
   */
  typeImport?: string;
  /**
   * Override fields with custom faker methods?
   */
  scalars?: ScalarsConfig;
  /**
   * Should we skip any fields? Notation is like: `VariantFragment.deliveryMethods`
   */
  skipFields?: string[];
  /**
   * Should we skip whole fragments? Notation is like: deliveryMethodInfo
   */
  skipFragments?: string[];
};

export type CodegenConfig = DefaultCodegenConfig & {
  generates: {
    [outputpath: string]: {
      config: PluginConfig;
    };
  };
};

export type Plugin = PluginFunction<PluginConfig>;

export type Enum = {
  enumName: string;
  enumValues: string[];
};

export type Union = {
  unionName: string;
  unionValues: string[];
};

// prettier-ignore
export type Field = {
  fieldName: string     // Name of a field in a Type or Fragment, e.g. name, brand, size, etc.
  objectName: string    // Name of the graphql-type the field is defined in. E.g. Product, Customer, etc.
  fieldType: string     // Name of the type of the field. E.g.  String, Boolean, Product, Customer.
  isArray?: boolean     // Is this field an array?
}

// prettier-ignore
export type FragmentField = {
  fields?: FragmentField[]      // Fragment fields can have 'nested' fields. See nested.test.ts for more details
  spreadName?: string           // Some 'fields' have a spreadName. See fragment_spread.test.ts for more details.
  isSpread?: boolean            // Some 'fields' are a spread. See fragment_spread.test.ts and inline_fragment.test.ts for more details.
} & Field

// prettier-ignore
export type Fragment = {
  fragmentName: string          // The name of the fragment. E.g. person, product, etc.
  objectName: string            // The name of the graphql-type this fragment is based on. E.g. Person, Product, etc.
  fields: FragmentField[]       // These fields are defined within the fragment
}
