import "swiper/css";
import "../scss/main.scss";
import "../utils/hello";
import "../components/slider-swiper";
import { variantOnChange } from "../components/variants-product";

import {
  btnAddToCart,
  deleteItem,
  onChangeItemCart,
  openCloseCart,
  recommendedProduct,
} from "../components/cart";
import { setQuantity } from "../utils/input-quantity";

import { openAccordion } from "../utils/accordion";
import { openDropDown } from "../components/header";
import { toggleDataActive } from "../utils/toggle-dataset";
import { validateRegisterCustomer } from "../components/news-letters";

validateRegisterCustomer();
variantOnChange(".variants");
recommendedProduct();
btnAddToCart(".add-product-cart");

openCloseCart();
deleteItem();
setQuantity();
onChangeItemCart();

openAccordion();
openDropDown();
toggleDataActive("#burger-nav-js", "#nav-list-js");
