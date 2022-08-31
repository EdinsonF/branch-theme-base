import { addRewardProduct, updateCart } from '../components/cart';
import { $Q } from './query-selector'

/**
 * Update the width of bar reward
 * @param {DOM element} input - input hidde with data
 */
export const barProgressReward = (input) => {

  const totalPrice = parseFloat(input.dataset.cartTotal) / 100;
  const limitPrice = input.dataset.limitPrice;
  const progressContainer = $Q(".progress-js");

  const barWidth = totalPrice / limitPrice * 100;

  pointColorEval(totalPrice);
  
  if (barWidth > barWidth) {
    progressContainer.style.width = "100%";
  } else {
    progressContainer.style.width = `${barWidth}%`;
  }
}

/**
 * eval price is exist price limit with total price
 * @param {number} totalPrice - total cart
 */
const pointColorEval = (totalPrice) => {

  const dataAll = $Q('#data-reward');
  const pointShipping = $Q('.point-shipping');
  const pointProductOne = $Q('.point-product-one');
  const pointProductTwo = $Q('.point-product-two');

  const productOne = dataAll?.dataset?.productOne;
  const productTwo = dataAll?.dataset?.productTwo;
  const limitFreeShipping = dataAll?.dataset?.amountFreeShipping;
  const limitProductOne = dataAll?.dataset?.amountProductOne;
  const limitProductTwo = dataAll?.dataset?.amountProductTwo;

  if(pointShipping) pointChangeColor(pointShipping, limitFreeShipping <= totalPrice)
  if(pointProductOne) productRewardSend(pointChangeColor(pointProductOne, limitProductOne <= totalPrice), productOne); 
  if(pointProductTwo) productRewardSend(pointChangeColor(pointProductTwo, limitProductTwo <= totalPrice), productTwo)
}

/**
 * chage color is true or false
 * @param {DOM element} point - element point brak
 * @param {boolean} condition - true or false is > or <
 */
const pointChangeColor = (point, condition) => {
  if(condition){
    point.classList.add('active');
    return true;
  }
  point.classList.remove('active');
  return false;
}

/**
 * add product reward or deleted in cart
 * @param {boolean} conditional - true or false
 * @param {number} id_product - id product current
 */
const productRewardSend = async (conditional, id_product) => {

  const productIsCart = $Q(`[data-id='${id_product}']`);

  if(conditional){
    if(productIsCart) return;
    await addRewardProduct(id_product)
    return;
  }

  if(!productIsCart) return;
  const indexItem = productIsCart.dataset.index; 
  updateCart(indexItem, 0, id_product)
}



