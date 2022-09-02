import { $Q } from './query-selector'

/**
 * Update the width of bar reward
 * @param {DOM element} input - input hidde with data
 */
export const barProgressReward = (input) => {

  if($Q('#is-show-rewards').dataset.activeRewards === 'false') return;

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

/* get all data dom */
const getDataAll = () => {

  const dataAll = $Q('#data-reward');
  const activeRewardOne = dataAll?.dataset?.activeRewardTwo;
  const activeRewardTwo = dataAll?.dataset?.activeRewardThree;

  const limitDiscountOne = dataAll?.dataset?.amountDiscountOne; 
  const limitDiscountTwo = dataAll?.dataset?.amountDiscountTwo;
  const limitDiscountThree = dataAll?.dataset?.amountDiscountThree;
  const discountOne = dataAll?.dataset?.discountOne;
  const discountTwo = dataAll?.dataset?.discountTwo;
  const discountThree = dataAll?.dataset?.discountThree;

  return {
    activeRewardOne,
    activeRewardTwo,
    limitDiscountOne,
    limitDiscountTwo,
    limitDiscountThree,
    discountOne,
    discountTwo,
    discountThree
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
    limitDiscountOne,
    limitDiscountTwo,
    limitDiscountThree
  } = getDataAll();
 
  /* only free shipping */
  if(activeRewardOne === 'false' && activeRewardTwo === 'false'){
    return ( totalPrice / limitDiscountOne) * 100;
  }

  /* only one rewards */
  limitDiscountThree = productsIsRewardsActive(activeRewardOne, activeRewardTwo, limitDiscountTwo, limitDiscountThree);

  
  /* all rewards */  
  let percentageBefore = 0;

  if (totalPrice <= limitDiscountOne){
    percentageBefore = calculatePercentageBefore(limitDiscountOne, 13);
  } else if (totalPrice > limitDiscountOne && totalPrice <= limitDiscountTwo) {
    percentageBefore = calculatePercentageBefore(limitDiscountTwo, 50);
  } else if (totalPrice > limitDiscountTwo && totalPrice < limitDiscountThree) {
    percentageBefore = calculatePercentageBefore(limitDiscountThree, 88); 
  }else {
    percentageBefore = 100;
  }

  let percentageAfter = totalPrice / percentageBefore;
  let totalBar =  calculatePercentageAfter(percentageAfter, totalPrice, limitDiscountThree);

  return totalBar;
}

/**
 * validate las rewards active
 * @param {boolean} activeRewardOne - true or false reward one
 * @param {boolean} activeRewardTwo - true or false reward two
 * @param {number} limitDiscountOne - limint reward one
 * @param {numeber} limitDiscountTwo - limint reward two
 */
const productsIsRewardsActive = (activeRewardOne, activeRewardTwo, limitDiscountOne, limitDiscountTwo) => {
  if((activeRewardOne === 'true' && activeRewardTwo === 'false' )
    || (activeRewardOne === 'false' && activeRewardTwo === 'true' ))
    {
      return activeRewardOne === 'true' ? limitDiscountOne : limitDiscountTwo; 
    }

    return limitDiscountTwo;

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
 * @param {number} limitDiscountTwo - limit product two rewards
 */
const calculatePercentageAfter = (percentageAfter, totalPrice, limitDiscountThree) => {

  let {
    limitDiscountOne,
    limitDiscountTwo
  } = getDataAll();
 
  if (totalPrice > limitDiscountOne && totalPrice <= limitDiscountTwo && percentageAfter < 13) {
    percentageAfter = 20;
  }else if (totalPrice > limitDiscountTwo && totalPrice < limitDiscountThree && percentageAfter < 50) {
    percentageAfter = 53;
  } else if (totalPrice >= limitDiscountThree && percentageAfter < 88) {  
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
    limitDiscountOne,
    limitDiscountTwo,
    limitDiscountThree
  } = getDataAll();

  const pointUnique = $Q('.point-unique');
  const pointProductOne = $Q('.point-product-one');
  const pointProductTwo = $Q('.point-product-two');

  if(pointUnique) pointChangeColor(pointUnique, limitDiscountOne <= totalPrice);
  if(pointProductOne) pointChangeColor(pointProductOne, limitDiscountTwo <= totalPrice);
  if(pointProductTwo) pointChangeColor(pointProductTwo, limitDiscountThree <= totalPrice);

}

/**
 * eval object product rewards
 * @param {number} totalPrice - total cart
 */
const validateProductsRewards = (totalPrice) => {

  let {
    discountOne,
    discountTwo,
    discountThree,
    limitDiscountOne,
    limitDiscountThree,
    limitDiscountTwo,
    activeRewardOne,
    activeRewardTwo
  } = getDataAll();

  const objectProduct = {
    [limitDiscountOne]: [limitDiscountOne, [discountOne]],
    ...(activeRewardOne === 'true' && {
      [limitDiscountTwo]: [limitDiscountTwo, [discountTwo]]
    }),
    ...(activeRewardTwo === 'true' && {
      [limitDiscountThree]: [limitDiscountThree,[ discountThree]]
    })
  }

  const objectArr = Object.keys(objectProduct);

  const dataProximity = objectArr.reverse().find(element => element < totalPrice);

  const rewardsMin = limitDiscountOne;

  if(totalPrice >= rewardsMin) {
    dataProximity &&
    evalAddDiscount(objectProduct[dataProximity], totalPrice);
  }else {
    $Q('#code-discount').value = '';
  }
}

/**
 * eval discount rewards or add or delete
 * @param {array} data - data product rewards
 * @param {number} totalPrice - total cart
 */
const evalAddDiscount = (data, totalPrice) => {

  if(!$Q('#code-discount')) return;
  /* if > limit rewards current */
  if(totalPrice >= data[0]) {

    if($Q('#code-discount').value !== data[1][0])
      discountRewardSend(data[1][0]);
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
 * add discount reward or deleted in cart
 * @param {string} code - code discount
 */
const discountRewardSend = async ( code ) => {

   $Q('#code-discount').value = code;   
}


