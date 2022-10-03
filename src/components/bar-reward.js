import { addRewardProduct } from './cart';
import { $Q } from '../utils/query-selector';

const {
  first: firstMark,
  second: secondMark,
  three: threeMark,
} = mark;

/**
 * get all data rewards and limits dom
 */
 const getDataAll = () => {

  if (!$Q('#data-reward')) return

  const dataAll = $Q('#data-reward');

  return {
    activeRewardOne: dataAll.dataset.activeRewardOne,
    activeRewardTwo: dataAll.dataset.activeRewardTwo,
    limitFreeShipping: dataAll.dataset.amountFreeShipping,
    limitProductOne: dataAll.dataset.amountProductOne,
    limitProductTwo: dataAll.dataset.amountProductTwo,
    productOne: dataAll.dataset.productOne,
    productTwo: dataAll.dataset.productTwo,
  }
}

/**
 * calculate percentage before break rewards
 * @param {number} limit - limit break reward price
 * @param {number} breakPoint - value break point dots
 */
 const calculatePercentageBefore = (limit, breakPoint) => (
  ((parseFloat(limit) / 100) / breakPoint) * 100
)

const breakOne = ({totalPrice, limitFreeShipping}) => {

  if (totalPrice <= limitFreeShipping) {
    return calculatePercentageBefore(limitFreeShipping, firstMark);
  }
}

const breackTwo = ({totalPrice, limitFreeShipping, limitProductOne}) => {

  if (totalPrice > limitFreeShipping && totalPrice <= limitProductOne) {
    return calculatePercentageBefore(limitProductOne, secondMark);
  }
}

const breakThree = ({
  totalPrice,
  limitProductOne,
  limitDiscountLast: limitProductTwo,
}) => {

  if (totalPrice > limitProductOne && totalPrice < limitProductTwo) {
    return calculatePercentageBefore(limitProductTwo, threeMark);
  }
}

/**
 *obtain the percentage of the bar before the break or maximum
 mark at your position
 * @param {Number} totalPrice - total cart
 * @param {Number} limitFreeShipping - price limit free shipping
 * @param {Number} limitProductOne - price limit rewards 1
 * @param {Number} limitDiscountLast - price limit rewards last
 */
const getPercentageBefore = ({
  totalPrice,
  limitFreeShipping,
  limitProductOne,
  limitDiscountLast,
}) => {

  const evalConditionBreak = {
    firstMark: breakOne,
    secondMark: breackTwo,
    threeMark: breakThree,
  }

  const keyArr = Object.keys(evalConditionBreak);

  const elementResult = keyArr.map((element) => {
  const rs = evalConditionBreak[element]({totalPrice,
    limitFreeShipping,
    limitProductOne,
    limitDiscountLast,
  })

    return rs;
  })

  const valorPercentage = elementResult.filter(
    (element) => element > 0)

  if (valorPercentage.length > 0) {
    return valorPercentage[0]
  }
    return 100;

}

const percentageOne = ({
  totalPrice,
  limitFreeShipping,
  limitProductOne,
  percentageAfter,
}) => {
  if (
    (totalPrice > limitFreeShipping)
    &&
    (totalPrice <= limitProductOne)
    &&
    (percentageAfter < firstMark)) {
     return 20;
  }

}

const percentageTwo = ({
  totalPrice,
  limitProductOne,
  percentageAfter,
  limitProductTwo,
}) => {
  if (
    (totalPrice > limitProductOne)
    &&
    (totalPrice < limitProductTwo)
    &&
    (percentageAfter < secondMark)) {
     return 53;
  }
}

const percentageThree = ({
  totalPrice,
  percentageAfter,
  limitProductTwo,
}) => {
  if (
    (totalPrice >= limitProductTwo)
    &&
    (percentageAfter < threeMark)) {
    return 100;
  }
}

/**
 * calculate percentage after break rewards
 * @param {number} percentageAfter - value percentage after dots break
 * @param {number} totalPrice - price cart total
 * @param {number} limitProductTwo - limit product two rewards
 */
 const calculatePercentageAfter = (
  percentageAfter,
  totalPrice,
  limitProductTwo,
) => {

  const {
    limitFreeShipping,
    limitProductOne,
  } = getDataAll();

  const evalConditionPercentage = {
    20: percentageOne,
    53: percentageTwo,
    100: percentageThree,
  }

  const keyObject = Object.keys(evalConditionPercentage);

  const resultPercentage = keyObject.filter(
    (element) => evalConditionPercentage[element]({
      totalPrice,
      limitFreeShipping,
      limitProductOne,
      percentageAfter,
      limitProductTwo,
    }),
  )

  if (resultPercentage.length > 0) {
    return resultPercentage[0]
  }

  return percentageAfter;
}

/**
 * validate which reward is the last one or two, to know which
 * will be 100% of the bar or which is the last reward.
 * @param {Boolean} activeRewardOne - is active reward 1 (true or false)
 * @param {Number} limitProductOne - limit product one rewards
 * @param {Number} limitProductTwo - limit product two rewards
 */
const isRewardOneOrTwoActive = (
  activeRewardOne,
  limitProductOne,
  limitProductTwo,
) => (
  activeRewardOne === 'true' ? limitProductOne : limitProductTwo
)

/**
 * check is active rewards one or two
 * @param {boolean} activeRewardOne - true or false reward one
 * @param {boolean} activeRewardTwo - true or false reward two
 * @param {number} limitProductOne - limit product one
 * @param {number} limitProductTwo - limit product two
 */
 const productsIsRewardsActive = ({
  activeRewardOne,
  activeRewardTwo,
  limitProductOne,
  limitProductTwo,
}) => {

  if ((activeRewardOne === 'true' && activeRewardTwo === 'false')
    ||
    (activeRewardOne === 'false' && activeRewardTwo === 'true')) {
      return isRewardOneOrTwoActive(
        activeRewardOne,
        limitProductOne,
        limitProductTwo,
      )
    }

    return limitProductTwo;
}

/**
 * chage color is true or false
 * @param {DOM element} point - element point brak
 * @param {boolean} condition - true or false is > or <
 */
 const pointChangeColor = (point, condition) => {
  if (condition) {
    point.classList.add('active');
    return true;
  }
  point.classList.remove('active');
  return false;
}

/**
 * eval price is exist price limit with total price
 * @param {number} totalPrice - total cart
 */
 const pointColorEval = (totalPrice) => {

  const {
    limitFreeShipping,
    limitProductOne,
    limitProductTwo,
  } = getDataAll();

  const pointShipping = $Q('.point-shipping');
  const pointProductOne = $Q('.point-product-one');
  const pointProductTwo = $Q('.point-product-two');

  const isLimitOne = limitFreeShipping <= totalPrice;
  const isLimitTwo = limitProductOne <= totalPrice;
  const isLimitThree = limitProductTwo <= totalPrice;

  if (pointShipping) pointChangeColor(pointShipping, isLimitOne);
  if (pointProductOne) pointChangeColor(pointProductOne, isLimitTwo);
  if (pointProductTwo) pointChangeColor(pointProductTwo, isLimitThree);

}

/**
 * if there is more than one reward pass to evaluate in
 * this function to return the value of the percentage
 * that the progress bar will have
 * @param {Object} Object - object {
    activeRewardOne,
    activeRewardTwo,
    limitFreeShipping,
    limitProductOne,
    limitProductTwo,
  }
 * @param {Number} totalPrice - total cart
 */
const calculateMoreOneRewards = (
  {
    activeRewardOne,
    activeRewardTwo,
    limitFreeShipping,
    limitProductOne,
    limitProductTwo,
  },
  totalPrice,
) => {

  const limitDiscountLast = productsIsRewardsActive({
    activeRewardOne,
    activeRewardTwo,
    limitProductOne,
    limitProductTwo,
  });

  const percentageBefore = getPercentageBefore({
    totalPrice,
    limitFreeShipping,
    limitProductOne,
    limitDiscountLast,
  })

  const percentageAfter = totalPrice / percentageBefore;
  const totalBar = calculatePercentageAfter(
    percentageAfter,
    totalPrice,
    limitDiscountLast,
  );

   return totalBar;
}

/**
 * validate porcentage match point break
 * @param {DOM element} input - input hidde with data
 */
 const validatePercentageMatch = (totalPrice) => {

  const {
    activeRewardOne,
    activeRewardTwo,
    limitFreeShipping,
  } = getDataAll();

  /* only free shipping */
  if (activeRewardOne === 'false' && activeRewardTwo === 'false') {
    return (totalPrice / limitFreeShipping) * 100;
  }

  return calculateMoreOneRewards(getDataAll(), totalPrice);

}

const conditionalRewardObject = (activeRewardOne, activeRewardTwo) => {
  if (activeRewardTwo === 'true' && activeRewardOne === 'false') return "two";
  if (activeRewardTwo === 'true' && activeRewardOne === 'true') return "three";
}

/**
 * obtain and sort all rewards data for further evaluation
 */
const objectDataRewards = () => {

  const {
    productOne,
    productTwo,
    limitFreeShipping,
    limitProductOne,
    limitProductTwo,
    activeRewardOne,
    activeRewardTwo,
  } = getDataAll();

  return {
    [limitFreeShipping]: [limitFreeShipping, null],

    ...(activeRewardOne === 'true' && {
      [limitProductOne]: [
        limitProductOne,
        [productOne],
        [productOne, productTwo],
      ],
    }),
    ...(conditionalRewardObject(activeRewardOne, activeRewardTwo) === "two" && {
      [limitProductTwo]: [
        limitProductTwo,
        [productTwo],
        [productTwo],
      ],
    }),
    ...(conditionalRewardObject(activeRewardOne, activeRewardTwo) === "three" && {
      [limitProductTwo]: [
        limitProductTwo,
        [ productOne, productTwo],
        [ productOne, productTwo],
      ],
    }),
  }
}

/**
 * add product reward or deleted in cart
 * @param {boolean} conditional - true or false
 * @param {number} id_product - id product current
 */
 const productRewardSend = async (itemsIds) => {

  await addRewardProduct(itemsIds)
}

const deletedProductReward = async (itemsIds) => {

await addRewardProduct(itemsIds)
}

const getDataProximity = (objectArr, totalPrice) => (
   objectArr.reverse().find(
    (element) => element < totalPrice)
)

const addRewardTwo = (data) => {
  if (!$Q(`[data-id='${data[1][1]}']`)) {
    productRewardSend({[data[1][0]]: 1, [data[1][1]]: 1});
  }
}

/**
 * add rewards
 * @param {Array} data - item current reward
 */
const addRewardOne = (data) => {
  if (!$Q(`[data-id='${data[1][0]}']`)) {
    productRewardSend({[data[1][0]]: 1});
  }
  if ($Q(`[data-id='${data[2][1]}']`)) {
    deletedProductReward({[data[2][1]]: 0});
  }
}

/**
 * eval delete rewards
 * @param {Array} data - item current reward
 */
const evalDeleteRewards = (data) => {
  if ($Q(`[data-id='${data[2][1]}']`)) {
    deletedProductReward({[data[1][0]]: 0, [data[1][1]]: 0});
  } else if ($Q(`[data-id='${data[2][0]}']`)) {
    deletedProductReward({[data[1][0]]: 0});
  }
}
/**
 * eval product add or deleted if exist
 * @param {array} data - info reward current
 * @param {number} totalPrice - total cart
 */
 const evalAddProduct = (data, totalPrice) => {

  const validateAddRewards = {
    2: addRewardTwo,
    1: addRewardOne,
  }
  if (totalPrice >= data[0]) {

    validateAddRewards[data[1].length](data);
  }

  if (totalPrice < data[0]) {
    evalDeleteRewards(data);
  }
}

const evalAddOrDeleteRewards = (
  totalPrice,
  dataProximity,
  objectProduct,
) => {

  const {
    limitProductOne,
    limitProductTwo,
    activeRewardOne,
    activeRewardTwo,
  } = getDataAll();

  const rewardsMin = activeRewardOne === 'true'
    ? limitProductOne
    : productsIsRewardsActive({
        activeRewardOne,
        activeRewardTwo,
        limitProductOne,
        limitProductTwo,
      });

  if (totalPrice >= rewardsMin) {
     if (dataProximity) {
      evalAddProduct(objectProduct[dataProximity], totalPrice);
     }
  } else {
    const limitProductLast = productsIsRewardsActive({
      activeRewardOne,
      activeRewardTwo,
      limitProductOne,
      limitProductTwo,
    });
    evalAddProduct(objectProduct[limitProductLast], totalPrice);
  }
}

/**
 * validate object rewards for add product cart
 * @param {number} totalPrice - total cart
 */
 const validateProductsRewards = (totalPrice) => {

  const objectProduct = objectDataRewards();

  const objectArr = Object.keys(objectProduct);

  const dataProximity = getDataProximity(objectArr, totalPrice)

  if (objectArr.length < 2) return;

  evalAddOrDeleteRewards(
    totalPrice,
    dataProximity,
    objectProduct,
  );
}

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

  if (barWidth > 100) {
    progressContainer.style.width = "100%";
  } else {
    progressContainer.style.width = `${barWidth}%`;
  }
}
