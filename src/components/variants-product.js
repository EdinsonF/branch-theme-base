import { $Q, $Qll } from "../utils/query-selector";
import { queryVariants } from "./variants-change";

/**
 * @param {HTMLElement} parent - Dom element parent of all seletors options
 * @returns Array of nodes
 */
 export const options = (parent) => $Qll('.js-option', parent);

/**
 * optionChecked
 * Iterates and searches for the options that were selected
 *
 * @param {HTMLElement} parent - Dom element parent of all seletors options
 * @returns A variant name - string reference
 */
 function optionsChecked(parent) {
  let myOptions = [];

  options(parent).forEach(
    (option) => {
      if (option.type === "radio") {
        if (option.checked === true) {
          myOptions = [...myOptions, option.value]
        }
      } else {
        myOptions = [...myOptions, option.value]
      }
    },
  )
  return buildOption(myOptions);
}

/**
 * selectVariant
 * Searches for a selected variant in an object stored in
 * the DOM (input[id="variants"])
 *
 * @param {HTMLElement} parent - Dom element parent of all seletors options
 * @returns Replacement of id in the dom (on input[name="id"])
 */
export function selectVariant(parent) {
  const variantName = optionsChecked(parent);
  const variants = JSON.parse($Q('#variants', parent).value);

  const variantFilter = variants.filter(
    (variant) => variant.title === variantName,
    )

  $Q('[name="id"]', parent).value = variantFilter[0].id
}

 function iterationOptions(parent) {
  return options(parent).forEach((option) => {
    option.addEventListener(
      'change',
      (e) => {
        console.log("chenged");
        selectVariant(parent);
        queryVariants(e);
      },
    );
  });

}

/**
 * @param {Array} options - Array of option names
 * @returns separate options with "/"
 */
export const buildOption = (options) => options.join(' / ');

 export const variantOnChange = (component) => {
  const parents = $Qll(component);

  if (parents.length > 1) {
    return parents.forEach(
      (parent) => iterationOptions(parent));
  }

  return iterationOptions(parents[0])
}
