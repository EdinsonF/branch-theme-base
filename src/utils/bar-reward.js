import { addRewardProduct, updateCart } from '../components/cart';
import { $Q } from './query-selector'

/**
 * Update the width of bar reward
 * @param {DOM element} input - input hidde with data
 */
export const barProgressReward = (input) => {

  const totalPrice = parseFloat(input.dataset.cartTotal) / 100;
  const progressContainer = $Q(".progress-js");

  const barWidth = validatePorcentageMatch(totalPrice);

  pointColorEval(totalPrice);
  
  if (barWidth > 100 ) {
    progressContainer.style.width = "100%";
  } else {
    progressContainer.style.width = `${barWidth}%`;
  }
}

/**
 * validate porcentage match point break
 * @param {DOM element} input - input hidde with data
 */
const validatePorcentageMatch = (totalPrice) => {
  const dataAll = $Q('#data-reward');
  const activeRewardOne = dataAll?.dataset?.activeRewardOne;
  const activeRewardTwo = dataAll?.dataset?.activeRewardTwo;
  const limitFreeShipping = dataAll?.dataset?.amountFreeShipping;
  const limitProductOne = dataAll?.dataset?.amountProductOne;
  const limitProductTwo = dataAll?.dataset?.amountProductTwo;
 
  if(activeRewardOne === 'false' && activeRewardTwo === 'false'){
    console.log("return", (limitFreeShipping / totalPrice) * 100);
    return ( totalPrice / limitFreeShipping) * 100;
  }

  let percentageBefore = 0;

  if (totalPrice <= limitFreeShipping){
    percentageBefore = calculatePorcentageBefore(limitFreeShipping, 19);
  } else if (totalPrice > limitFreeShipping && totalPrice <= limitProductOne) {
    percentageBefore = calculatePorcentageBefore(limitProductOne, 50); 
  } else if (totalPrice > limitProductOne && totalPrice < limitProductTwo) {
    percentageBefore = calculatePorcentageBefore(limitProductTwo, 81); 
  }else {
    percentageBefore = 100;
  }

  let percentageAfter = totalPrice / percentageBefore;
  let totalBar =  calculatePercentageAfter(totalPrice, limitFreeShipping, limitProductOne, limitProductTwo, percentageAfter);

  return totalBar;
}

const calculatePorcentageBefore = (limit, breakPoint) => {
  return ((parseFloat(limit) / 100) / breakPoint) * 100;
}

const calculatePercentageAfter = (totalPrice, limitFreeShipping, limitProductOne, limitProductTwo, percentageAfter) => {

  if (totalPrice > limitFreeShipping && totalPrice <= limitProductOne && percentageAfter < 19) {
    percentageAfter = 25;
  }else if (totalPrice > limitProductOne && totalPrice < limitProductTwo && percentageAfter < 50) {
    percentageAfter = 53;
  } else if (totalPrice >= limitProductTwo && percentageAfter < 81) {  
    percentageAfter = 100;
  }

  return percentageAfter;
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

  if(pointShipping) pointChangeColor(pointShipping, limitFreeShipping <= totalPrice);
  if(pointProductOne) pointChangeColor(pointProductOne, limitProductOne <= totalPrice);
  if(pointProductTwo) pointChangeColor(pointProductTwo, limitProductTwo <= totalPrice);


  const objectProduct = {
    [limitFreeShipping]: [limitFreeShipping, null],
    [limitProductOne]: [limitProductOne, [productOne],[productOne, productTwo]],
    [limitProductTwo]: [limitProductTwo, [productOne, productTwo],[productOne, productTwo]]

  }

  console.log("object", objectProduct);

  if(totalPrice >= limitProductOne) {
    const dataProximity = Object.keys(objectProduct).reverse().find(element => element < totalPrice);

    evalAddProduct(objectProduct[dataProximity], totalPrice);
  }else {
    console.log("vaciar carrito completo");
    evalAddProduct(objectProduct[limitProductTwo], totalPrice);
  }
  
  
    /* productRewardSendTwo(, { [productOne] : 1 , [productTwo]:1 })

    productRewardSendOne(, { [productOne] : 1 }); */

     
  
}

const evalAddProduct = (data, totalPrice) => {

  if(totalPrice >= data[0]) {

    if(data[1].length === 2 ){
      console.log("debe agregar 2 producto");

      if(!$Q(`[data-id='${data[1][1]}']`)){
        productRewardSend({[data[1][0]]: 1, [data[1][1]]: 1});
      }
    }else if (data[1].length === 1){
      console.log("debe agregar 1 producto");
      if(!$Q(`[data-id='${data[1][0]}']`)){
        productRewardSend({[data[1][0]]: 1});
      }
      if($Q(`[data-id='${data[2][1]}']`)){
        deletedProductReward({[data[2][1]]: 0});
      }
    }else {
      console.log("agregar producto");
    }
  }

  if(totalPrice < data[0]){
    console.log("deleted products");

    if($Q(`[data-id='${data[2][1]}']`)){
        deletedProductReward({[data[1][0]]: 0, [data[1][1]]: 0});
      }else if ($Q(`[data-id='${data[2][0]}']`)){
        deletedProductReward({[data[1][0]]: 0});
      }else {
      console.log("eliminar productos");
    }
  }
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
const productRewardSend = async ( itemsIds ) => {

    await addRewardProduct(itemsIds)
    
}

const deletedProductReward = async ( itemsIds ) => {

  await addRewardProduct(itemsIds)
 
}


