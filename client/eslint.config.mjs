import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const noHardcodedColorsRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow hardcoded color utility classes and arbitrary hexes in className",
    },
    schema: [],
  },
  create(context) {
    const hardcodedPattern = /\b(bg-white|text-black|bg-gray-\d+|text-gray-\d+|bg-slate-\d+|text-slate-\d+|bg-neutral-\d+|text-neutral-\d+|\[#[0-9a-fA-F]{3,8}\])\b/;
    return {
      JSXAttribute(node) {
        if (node.name && node.name.name === "className") {
          let val = "";
          if (node.value && node.value.type === "Literal" && typeof node.value.value === "string") {
            val = node.value.value;
          }
          if (val && hardcodedPattern.test(val)) {
            const match = val.match(hardcodedPattern);
            context.report({
              node,
              message: `Avoid hardcoded color class "${match ? match[0] : ""}". Use semantic tokens (bg-background, text-foreground, bg-card, text-muted-foreground, etc.).`,
            });
          }
        }
      },
    };
  },
};

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      "design-system": {
        rules: {
          "no-hardcoded-colors": noHardcodedColorsRule,
        },
      },
    },
    rules: {
      "design-system/no-hardcoded-colors": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unnecessary-type-constraint": "off",
      "@typescript-eslint/no-wrapper-object-types": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
    },
  },
];

export default eslintConfig;
