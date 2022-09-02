import { addRewardProduct, updateCart } from '../components/cart';
import { $Q } from './query-selector'

/**
 * Update the width of bar reward
 * @param {DOM element} input - input hidde with data
 */
export const barProgressReward = (input) => {

  const totalPrice = parseFloat(input.dataset.cartTotal) / 100;
  const progressContainer = $Q(".progress-js");

  const barWidth = validatePercentageMatch(totalPrice);

  pointColorEval(totalPrice);
  validateProductsRewards(totalPrice);
  
  if (barWidth > 100 ) {
    progressContainer.style.width = "100%";
  } else {
    progressContainer.style.width = `${barWidth}%`;
  }
}

/**
 * get all data dom
 */
const getDataAll = () => {

  const dataAll = $Q('#data-reward');
  const activeRewardOne = dataAll?.dataset?.activeRewardOne;
  const activeRewardTwo = dataAll?.dataset?.activeRewardTwo;
  const limitFreeShipping = dataAll?.dataset?.amountFreeShipping;
  const limitProductOne = dataAll?.dataset?.amountProductOne;
  const limitProductTwo = dataAll?.dataset?.amountProductTwo;
  const productOne = dataAll?.dataset?.productOne;
  const productTwo = dataAll?.dataset?.productTwo;

  return {
    activeRewardOne,
    activeRewardTwo,
    limitFreeShipping,
    limitProductOne,
    limitProductTwo,
    productOne,
    productTwo
  }
}

/**
 * validate porcentage match point break
 * @param {DOM element} input - input hidde with data
 */
const validatePercentageMatch = (totalPrice) => {
  
  let {
    activeRewardOne,
    activeRewardTwo,
    limitFreeShipping,
    limitProductOne,
    limitProductTwo
  } = getDataAll();
 
  /* only free shipping */
  if(activeRewardOne === 'false' && activeRewardTwo === 'false'){
    return ( totalPrice / limitFreeShipping) * 100;
  }

  /* only one rewards */
  limitProductTwo = productsIsRewardsActive(activeRewardOne, activeRewardTwo, limitProductOne, limitProductTwo);
  
  /* all rewards */  
  let percentageBefore = 0;

  if (totalPrice <= limitFreeShipping){
    percentageBefore = calculatePercentageBefore(limitFreeShipping, 13);
  } else if (totalPrice > limitFreeShipping && totalPrice <= limitProductOne) {
    percentageBefore = calculatePercentageBefore(limitProductOne, 50); 
  } else if (totalPrice > limitProductOne && totalPrice < limitProductTwo) {
    percentageBefore = calculatePercentageBefore(limitProductTwo, 88); 
  }else {
    percentageBefore = 100;
  }

  let percentageAfter = totalPrice / percentageBefore;
  let totalBar =  calculatePercentageAfter(percentageAfter, totalPrice, limitProductTwo);

  return totalBar;
}

/**
 * check is active rewards one or two
 * @param {boolean} activeRewardOne - true or false reward one
 * @param {boolean} activeRewardTwo - true or false reward two
 * @param {number} limitProductOne - limit product one
 * @param {number} limitProductTwo - limit product two
 */
const productsIsRewardsActive = (activeRewardOne, activeRewardTwo, limitProductOne, limitProductTwo) => {
  if((activeRewardOne === 'true' && activeRewardTwo === 'false' )
    || (activeRewardOne === 'false' && activeRewardTwo === 'true' ))
    {
      return activeRewardOne === 'true' ? limitProductOne : limitProductTwo; 
    }

    return limitProductTwo;
}

/**
 * calculate percentage before break rewards
 * @param {number} limit - limit break reward price
 * @param {number} breakPoint - value break point dots
 */
const calculatePercentageBefore = (limit, breakPoint) => {
  return ((parseFloat(limit) / 100) / breakPoint) * 100;
}

/**
 * calculate percentage after break rewards
 * @param {number} percentageAfter - value percentage after dots break
 * @param {number} totalPrice - price cart total
 * @param {number} limitProductTwo - limit product two rewards
 */
const calculatePercentageAfter = (percentageAfter, totalPrice, limitProductTwo) => {

  let {
    limitFreeShipping,
    limitProductOne
  } = getDataAll();
 
  if (totalPrice > limitFreeShipping && totalPrice <= limitProductOne && percentageAfter < 13) {
    percentageAfter = 20;
  }else if (totalPrice > limitProductOne && totalPrice < limitProductTwo && percentageAfter < 50) {
    percentageAfter = 53;
  } else if (totalPrice >= limitProductTwo && percentageAfter < 88) {  
    percentageAfter = 100;
  }

  return percentageAfter;
}

/**
 * eval price is exist price limit with total price
 * @param {number} totalPrice - total cart
 */
const pointColorEval = (totalPrice) => {

  const {
    limitFreeShipping,
    limitProductOne,
    limitProductTwo
  } = getDataAll();

  const pointShipping = $Q('.point-shipping');
  const pointProductOne = $Q('.point-product-one');
  const pointProductTwo = $Q('.point-product-two');

  if(pointShipping) pointChangeColor(pointShipping, limitFreeShipping <= totalPrice);
  if(pointProductOne) pointChangeColor(pointProductOne, limitProductOne <= totalPrice);
  if(pointProductTwo) pointChangeColor(pointProductTwo, limitProductTwo <= totalPrice);

}

/**
 * validate object rewards for add product cart
 * @param {number} totalPrice - total cart
 */
const validateProductsRewards = (totalPrice) => {

  let {
    productOne,
    productTwo,
    limitFreeShipping,
    limitProductOne,
    limitProductTwo,
    activeRewardOne,
    activeRewardTwo
  } = getDataAll();

  const objectProduct = {
    [limitFreeShipping]: [limitFreeShipping, null],
    ...(activeRewardOne === 'true' && {
      [limitProductOne]: [limitProductOne, [productOne],[productOne, productTwo]]
    }),
    ...(activeRewardTwo === 'true' && activeRewardOne === 'false' && {
      [limitProductTwo]: [
        limitProductTwo, 
        [ productTwo],
        [ productTwo]
      ]
    }),
    ...(activeRewardTwo === 'true' && activeRewardOne === 'true' && {
      [limitProductTwo]: [
        limitProductTwo, 
        [ productOne, productTwo],
        [ productOne, productTwo]
      ]
    })
  }


  const objectArr = Object.keys(objectProduct);

  const dataProximity = objectArr.reverse().find(element => element < totalPrice);

  if(objectArr.length < 2) return;

  const rewardsMin = activeRewardOne === 'true' 
    ? limitProductOne 
    : productsIsRewardsActive(activeRewardOne, activeRewardTwo, limitProductOne, limitProductTwo);

  if(totalPrice >= rewardsMin) {
     dataProximity &&
    evalAddProduct(objectProduct[dataProximity], totalPrice);
  }else {
    limitProductTwo = productsIsRewardsActive(activeRewardOne, activeRewardTwo, limitProductOne, limitProductTwo);
    evalAddProduct(objectProduct[limitProductTwo], totalPrice);
  }
}

/**
 * eval product add or deleted if exist
 * @param {array} data - info reward current
 * @param {number} totalPrice - total cart
 */
const evalAddProduct = (data, totalPrice) => {

  if(totalPrice >= data[0]) {

    if(data[1].length === 2 ){
  
      if(!$Q(`[data-id='${data[1][1]}']`)){
        productRewardSend({[data[1][0]]: 1, [data[1][1]]: 1});
      }
    }else if (data[1].length === 1){
    
      if(!$Q(`[data-id='${data[1][0]}']`)){
        productRewardSend({[data[1][0]]: 1});
      }
      if($Q(`[data-id='${data[2][1]}']`)){
        deletedProductReward({[data[2][1]]: 0});
      }
    }
  }

  if(totalPrice < data[0]){

    if($Q(`[data-id='${data[2][1]}']`)){
        deletedProductReward({[data[1][0]]: 0, [data[1][1]]: 0});
      }else if ($Q(`[data-id='${data[2][0]}']`)){
        deletedProductReward({[data[1][0]]: 0});
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


