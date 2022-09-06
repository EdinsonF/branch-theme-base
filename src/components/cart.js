import api from "../services/api";
import { $Q, $Qll } from "../utils/query-selector";
import { dataToggle, toggleDataActive } from "../utils/toggle-dataset";
import {
  updateCartItems,
  updatetotalPrice,
  updateCartbutton,
  updatePriceItem
} from "./update-cart";
import { getDataVariant } from "./variants-change";
import { options, selectVariant } from "./variants-product";

const CART_SECTION = "side-cart,cart-page";

/**
 * Listen if add to cart form is submited
 * if add to cart form is submited add products in cart
 * 
 * @param {string} formQuery - className reference in form add-to-cart
 * 
 * To active this feature - ADD className 'add-cart-js' in form product
 * */
export const btnAddToCart = (formQuery) => {
  const addForms = $Qll(formQuery);

  if(addForms != null) {
    addForms.forEach(
      form => {
        submitForm(form);
      }
    )
  }
}

export const selectVarianSideCart = (component) => {
  const parents = $Qll(component);

  if (parents.length > 0) {
    return parents.forEach(
      parent => {
        addChangeEvent(parent)
      }
    );
  }

}

export const addChangeEvent = (parent) => {

  options(parent).forEach(option => {
    option.addEventListener(
      'change',
      (e) => {
        selectVariant(parent);
        getDataVariant(parent);
      }
    );
  });
}

const submitForm = (form) => {
  return form.addEventListener(
    "submit",
    (e) => {
      e.preventDefault();
      addProducts(e);

      dataToggle($Q("#shopify-section-side-cart"), true);
    }
  )
}

/**
 * Add products in cart
 * @param {event} event -Event submit from add to cart form
 */
const addProducts = async (event) => {

  let itemId = 0;
  
  for(const input of event.target) {
    if(input.name === "id"){
      itemId = input.value;
    }
  }

  const cartParams = {
    items: [
      {
        id: itemId,
        quantity: 1,
      }
    ],
    sections: CART_SECTION
  };

  const { sections = null } = await api.addToCart(cartParams);
  if (!sections) return null;

  updateCartItems(sections["side-cart"]);
  updateCartbutton(sections["side-cart"]);
  updatetotalPrice(sections["side-cart"]);
}

/**
 * Event onChange in the cart item
 */

export const onChangeItemCart = () => {
  $Qll('.item-cart-js').forEach(
    input => {
      input.addEventListener(
        'change',
        function () {
          updateCart(this.dataset.index, this.value, this.id);
        }
      )
    }
  )
}

/**
 * Update quantity for each item in cart
 * @param {number} id Product ID
 * @param {number} quantity new quantity
 */
export const updateCart = async (line, quantity, id) => {
  
  console.log("id", id);
  addSpinner(`#price-${id}`);
  
  const cartParams = {
    line,
    quantity,
    sections: CART_SECTION,
  }

  const { sections = null } = await api.changeCart(cartParams);
  
  if (!sections) return null;

  if (quantity === 0) {
    updateCartItems(sections["side-cart"]);
    updateCartbutton(sections["side-cart"]);
    updatetotalPrice(sections["side-cart"]);
  } else {
    updatePriceItem(sections["side-cart"], id);
    updateCartbutton(sections["side-cart"]);
    updatetotalPrice(sections["side-cart"]);
  }
}

/**
 * Replace en element with a spinner
 * @param {String} element 
 */
 const addSpinner = (element) => {
  $Q(element).innerHTML = '<div class="loading"></div>';
}


/**
 * Delete item in cart
 * listen if delete button is clicked
 * if is clicked, update cart with quantity 0
 */
export const deleteItem = () => {
  const deleteIcon = $Qll(".item-delete");

  if (deleteIcon) {
    deleteIcon.forEach(
      element => {
        const { dataset: { id, index } } = element;
        element.addEventListener(
          "click",
          () => {
            updateCart(index, 0, `${id}-${index}`)
          }
        )
      }
    );
  }
}


/**
* Open and close side cart with various buttons
*/
export const openCloseCart = () => {
  const cartContainer = $Q(".cart");
  cartContainer.setAttribute("data-active", "false");

  toggleDataActive(
    ".cart-close",
    "#shopify-section-side-cart",
    { overlay: true }
  )

  toggleDataActive(
    ".button-cart",
    "#shopify-section-side-cart",
    { overlay: true }
  )
}