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

const getDataAll = () => {

  const dataAll = $Q('#data-reward');
  const activeRewardOne = dataAll?.dataset?.activeRewardTwo;
  const activeRewardTwo = dataAll?.dataset?.activeRewardThree;

  const limitProductOne = dataAll?.dataset?.amountProductOne; 
  const limitProductTwo = dataAll?.dataset?.amountProductTwo;
  const limitProductThree = dataAll?.dataset?.amountProductThree;
  const productOne = dataAll?.dataset?.productOne;
  const productTwo = dataAll?.dataset?.productTwo;
  const productThree = dataAll?.dataset?.productThree;

  return {
    activeRewardOne,
    activeRewardTwo,
    limitProductOne,
    limitProductTwo,
    limitProductThree,
    productOne,
    productTwo,
    productThree
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
    limitProductOne,
    limitProductTwo,
    limitProductThree
  } = getDataAll();
 
  /* only free shipping */
  if(activeRewardOne === 'false' && activeRewardTwo === 'false'){
    return ( totalPrice / limitProductOne) * 100;
  }

  /* only one rewards */
  limitProductThree = productsIsRewardsActive(activeRewardOne, activeRewardTwo, limitProductTwo, limitProductThree);

  
  /* all rewards */  
  let percentageBefore = 0;

  
  if (totalPrice <= limitProductOne){
    percentageBefore = calculatePercentageBefore(limitProductOne, 13);
  } else if (totalPrice > limitProductOne && totalPrice <= limitProductTwo) {
    percentageBefore = calculatePercentageBefore(limitProductTwo, 50);
  } else if (totalPrice > limitProductTwo && totalPrice < limitProductThree) {
    percentageBefore = calculatePercentageBefore(limitProductThree, 88); 
  }else {
    percentageBefore = 100;
  }

  let percentageAfter = totalPrice / percentageBefore;
  let totalBar =  calculatePercentageAfter(percentageAfter, totalPrice, limitProductThree);

  return totalBar;
}

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
const calculatePercentageAfter = (percentageAfter, totalPrice, limitProductThree) => {

  let {
    limitProductOne,
    limitProductTwo
  } = getDataAll();
 
  if (totalPrice > limitProductOne && totalPrice <= limitProductTwo && percentageAfter < 13) {
    percentageAfter = 20;
  }else if (totalPrice > limitProductTwo && totalPrice < limitProductThree && percentageAfter < 50) {
    percentageAfter = 53;
  } else if (totalPrice >= limitProductThree && percentageAfter < 88) {  
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
    limitProductOne,
    limitProductTwo,
    limitProductThree
  } = getDataAll();

  const pointUnique = $Q('.point-unique');
  const pointProductOne = $Q('.point-product-one');
  const pointProductTwo = $Q('.point-product-two');

  if(pointUnique) pointChangeColor(pointUnique, limitProductOne <= totalPrice);
  if(pointProductOne) pointChangeColor(pointProductOne, limitProductTwo <= totalPrice);
  if(pointProductTwo) pointChangeColor(pointProductTwo, limitProductThree <= totalPrice);

}

const validateProductsRewards = (totalPrice) => {

  let {
    productOne,
    productTwo,
    productThree,
    limitProductOne,
    limitProductThree,
    limitProductTwo,
    activeRewardOne,
    activeRewardTwo
  } = getDataAll();

  const objectProduct = {
    [limitProductOne]: [limitProductOne, [productOne], [productOne, productTwo, productThree]],
    ...(activeRewardOne === 'true' && {
      [limitProductTwo]: [limitProductTwo, [productOne, productTwo],[productTwo, productThree]]
    }),
    ...(activeRewardTwo === 'true' && activeRewardOne === 'false' && {
      [limitProductThree]: [
        limitProductThree, 
        [ productThree],
        [ productThree]
      ]
    }),
    ...(activeRewardTwo === 'true' && activeRewardOne === 'true' && {
      [limitProductThree]: [
        limitProductThree, 
        [ productOne, productTwo, productThree],
        [ productOne, productTwo, productThree]
      ]
    })
  }


  const objectArr = Object.keys(objectProduct);

  const dataProximity = objectArr.reverse().find(element => element < totalPrice);

  if(objectArr.length < 2) return;

  const rewardsMin = limitProductOne;

  if(totalPrice >= rewardsMin) {
     dataProximity &&
    evalAddProduct(objectProduct[dataProximity], totalPrice);
  }else {
    limitProductThree = rewardsMin;
    evalAddProduct(objectProduct[limitProductThree], totalPrice);
  }
}

const evalAddProduct = (data, totalPrice) => {

  if(totalPrice >= data[0]) {

    if(data[1].length === 3 ){

      if(!$Q(`[data-id='${data[1][2]}']`)){
        productRewardSend({[data[1][0]]: 1, [data[1][1]]: 1, [data[1][2]]: 1});
      }
    }else if(data[1].length === 2 ){

      if(!$Q(`[data-id='${data[1][1]}']`)){
        productRewardSend({[data[1][0]]: 1, [data[1][1]]: 1});
      }
      if($Q(`[data-id='${data[2][1]}']`)){
        deletedProductReward({[data[2][1]]: 0});
      }
    }else if (data[1].length === 1){

      if(!$Q(`[data-id='${data[1][0]}']`)){
        productRewardSend({[data[1][0]]: 1});
      }
      
      if($Q(`[data-id='${data[2][2]}']`)){

        deletedProductReward({[data[2][1]]: 0, [data[2][2]]: 0});
      }else if($Q(`[data-id='${data[2][1]}']`)){

        deletedProductReward({[data[2][1]]: 0});
      }
    }
  }

  if(totalPrice < data[0]){

    if($Q(`[data-id='${data[2][1]}']`)){
        deletedProductReward({[data[2][0]]: 0, [data[2][1]]: 0, [data[2][2]]: 0});
      }else if ($Q(`[data-id='${data[2][1]}']`)){
        deletedProductReward({[data[2][0]]: 0, [data[2][1]]: 0});
      }else if ($Q(`[data-id='${data[2][0]}']`)){
        deletedProductReward({[data[2][0]]: 0});
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


