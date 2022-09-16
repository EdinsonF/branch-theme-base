import { addRewardProduct } from './cart';
import { $Q } from '../utils/query-selector'

/* get all data dom */
const getDataAll = () => {

  if (!$Q('#data-reward')) return;
  const dataAll = $Q('#data-reward');

  return {
    activeRewardOne: dataAll.dataset.activeRewardTwo,
    activeRewardTwo: dataAll.dataset.activeRewardThree,
    limitProductOne: dataAll.dataset.amountProductOne,
    limitProductTwo: dataAll.dataset.amountProductTwo,
    limitProductThree: dataAll.dataset.amountProductThree,
    productOne: dataAll.dataset.productOne,
    productTwo: dataAll.dataset.productTwo,
    productThree: dataAll.dataset.productThree,
  }
}

const isRewardOneOrTwoActive = (
  activeRewardOne,
  limitProductTwo,
  limitProductThree,
  ) => (
  activeRewardOne === 'true' ? limitProductTwo : limitProductThree
)
/**
 * validate las rewards active
 * @param {boolean} activeRewardOne - true or false reward one
 * @param {boolean} activeRewardTwo - true or false reward two
 * @param {number} limitProductOne - limint reward one
 * @param {numeber} limitProductTwo - limint reward two
 */
const productsIsRewardsActive = ({
  activeRewardOne,
  activeRewardTwo,
  limitProductTwo,
  limitProductThree,
  }) => {
  if ((activeRewardOne === 'true' && activeRewardTwo === 'false')
    || (activeRewardOne === 'false' && activeRewardTwo === 'true')) {
      return isRewardOneOrTwoActive(
        activeRewardOne,
        limitProductTwo,
        limitProductThree,
      )
    }

    return limitProductThree;
}

/**
 * calculate percentage before break rewards
 * @param {number} limit - limit break reward price
 * @param {number} breakPoint - value break point dots
 */
 const calculatePercentageBefore = (limit, breakPoint) => (
  ((parseFloat(limit) / 100) / breakPoint) * 100
)

const percentageBeforeOne = ({totalPrice, limitProductOne}) => {

  if (totalPrice <= limitProductOne) {
    return calculatePercentageBefore(limitProductOne, 13);
  }
}

const percentageBeforeTwo = ({
  totalPrice,
  limitProductOne,
  limitProductTwo,
}) => {

  if (totalPrice > limitProductOne && totalPrice <= limitProductTwo) {
    return calculatePercentageBefore(limitProductTwo, 50);
  }
}

const percentageBeforeThree = ({
  totalPrice,
  limitProductTwo,
  limitProductLast,
}) => {

  if (totalPrice > limitProductTwo && totalPrice < limitProductLast) {
    return calculatePercentageBefore(limitProductLast, 88);
  }
}

const getPercentageBefore = ({
  totalPrice,
  limitProductTwo,
  limitProductOne,
  limitProductLast,
}) => {

  const evalPercentageBefore = {
    13: percentageBeforeOne,
    50: percentageBeforeTwo,
    88: percentageBeforeThree,
  }

  const keyArr = Object.keys(evalPercentageBefore);

  const elementResult = keyArr.map((element) => {
  const rs = evalPercentageBefore[element]({
    totalPrice,
    limitProductOne,
    limitProductTwo,
    limitProductLast,
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

const percentageAfterOne = ({
  totalPrice,
  limitProductOne,
  limitProductTwo,
  percentageAfter,
}) => {

  if (
    (totalPrice > limitProductOne)
    &&
    (totalPrice <= limitProductTwo)
    &&
    (percentageAfter < 13)) {
    return 20;
  }
}

const percentageAfterTwo = ({
  totalPrice,
  limitProductTwo,
  percentageAfter,
  limitProductThree,
}) => {
  if (
    (totalPrice > limitProductTwo)
    &&
    (totalPrice < limitProductThree)
    &&
    (percentageAfter < 50)) {
    return 53;
  }
}

const percentageAfterThree = ({
  totalPrice,
  percentageAfter,
  limitProductThree,
}) => {
  if (totalPrice >= limitProductThree && percentageAfter < 88) {
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
  limitProductThree,
  ) => {

  const {
    limitProductOne,
    limitProductTwo,
  } = getDataAll();

  const evalPercentageAfter = {
    20: percentageAfterOne,
    53: percentageAfterTwo,
    100: percentageAfterThree,
  }

  const keyObject = Object.keys(evalPercentageAfter);

  const resultPercentage = keyObject.filter(
    (element) => evalPercentageAfter[element]({
      totalPrice,
      percentageAfter,
      limitProductOne,
      limitProductTwo,
      limitProductThree,
    }),
  )

  if (resultPercentage.length > 0) {
    return resultPercentage[0]
  }

  return percentageAfter;
}

const calculateMoreOneRewards = (
  {
    activeRewardOne,
    activeRewardTwo,
    limitProductOne,
    limitProductTwo,
    limitProductThree,
  },
  totalPrice,
) => {

  const limitProductLast = productsIsRewardsActive({
    activeRewardOne,
    activeRewardTwo,
    limitProductTwo,
    limitProductThree,
  });

  const percentageBefore = getPercentageBefore({
    totalPrice,
    limitProductOne,
    limitProductTwo,
    limitProductLast,
  })

  const percentageAfter = totalPrice / percentageBefore;
  const totalBar = calculatePercentageAfter(
    percentageAfter,
    totalPrice,
    limitProductLast,
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
    limitProductOne,
  } = getDataAll();

  /* only free shipping */
  if (activeRewardOne === 'false' && activeRewardTwo === 'false') {
    return (totalPrice / limitProductOne) * 100;
  }

  return calculateMoreOneRewards(getDataAll(), totalPrice);

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
    limitProductOne,
    limitProductTwo,
    limitProductThree,
  } = getDataAll();

  const pointUnique = $Q('.point-unique');
  const pointProductOne = $Q('.point-product-one');
  const pointProductTwo = $Q('.point-product-two');

  const isLimitOne = limitProductOne <= totalPrice;
  const isLimitTwo = limitProductTwo <= totalPrice;
  const isLimitThree = limitProductThree <= totalPrice;

  if (pointUnique) pointChangeColor(pointUnique, isLimitOne);
  if (pointProductOne) pointChangeColor(pointProductOne, isLimitTwo);
  if (pointProductTwo) pointChangeColor(pointProductTwo, isLimitThree);

}

const conditionalRewardObject = (activeRewardOne, activeRewardTwo) => {
  if (activeRewardTwo === 'true' && activeRewardOne === 'false') return "two";
  if (activeRewardTwo === 'true' && activeRewardOne === 'true') return "three";
}

const objectDataRewards = () => {

  const {
    productOne,
    productTwo,
    productThree,
    limitProductOne,
    limitProductThree,
    limitProductTwo,
    activeRewardOne,
    activeRewardTwo,
  } = getDataAll();

  return {
    [limitProductOne]: [
      limitProductOne,
      [productOne],
      [productOne, productTwo, productThree],
    ],

    ...(activeRewardOne === 'true' && {
      [limitProductTwo]: [
        limitProductTwo,
        [productOne, productTwo],
        [productTwo, productThree],
      ],
    }),
    ...(conditionalRewardObject(activeRewardOne, activeRewardTwo) === "two" && {
      [limitProductThree]: [
        limitProductThree,
        [ productOne, productThree],
        [productThree],
      ],
    }),
    ...(conditionalRewardObject(activeRewardOne, activeRewardTwo) === "three" && {
      [limitProductThree]: [
        limitProductThree,
        [ productOne, productTwo, productThree],
        [ productOne, productTwo, productThree],
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

const validateRewardsThree = (data) => {
  if (!$Q(`[data-id='${data[1][2]}']`)) {
    productRewardSend({
      [data[1][0]]: 1,
      [data[1][1]]: 1,
      [data[1][2]]: 1,
    });
  }
}

const validateRewardsTwo = (data) => {
  if (!$Q(`[data-id='${data[1][1]}']`)) {
    productRewardSend({
      [data[1][0]]: 1,
      [data[1][1]]: 1,
    });
  }
  if ($Q(`[data-id='${data[2][1]}']`)) {
    deletedProductReward({[data[2][1]]: 0});
  }
}

const validateRewardsOne = (data) => {
  if (!$Q(`[data-id='${data[1][0]}']`)) {
    productRewardSend({[data[1][0]]: 1});
  }

  if ($Q(`[data-id='${data[2][2]}']`)) {
    deletedProductReward({
      [data[2][1]]: 0,
      [data[2][2]]: 0,
    });
  } else if ($Q(`[data-id='${data[2][1]}']`)) {
    deletedProductReward({[data[2][1]]: 0});
  }
}

/**
 * eval product rewards or add or delete
 * @param {array} data - data product rewards
 * @param {number} totalPrice - total cart
 */
 const evalAddProduct = (data) => {

  /* if > limit rewards current */

  const validateSizeArrRewards = {
    3: validateRewardsThree,
    2: validateRewardsTwo,
    1: validateRewardsOne,
  }

  validateSizeArrRewards[data[1].length](data);

}

const evalDeleteProduct = (data) => {

  if ($Q(`[data-id='${data[2][2]}']`)) {
    deletedProductReward({
      [data[2][0]]: 0,
      [data[2][1]]: 0,
      [data[2][2]]: 0,
    });
  } else if ($Q(`[data-id='${data[2][1]}']`)) {
    deletedProductReward({
      [data[2][0]]: 0,
      [data[2][1]]: 0,
    });
  } else if ($Q(`[data-id='${data[2][0]}']`)) {
    deletedProductReward({[data[2][0]]: 0});
  }
}

/**
 * eval object product rewards
 * @param {number} totalPrice - total cart
 */
 const validateProductsRewards = (totalPrice) => {

  const {
    limitProductOne,
  } = getDataAll();

  const objectProduct = objectDataRewards();

  const objectArr = Object.keys(objectProduct);

  const dataProximity = objectArr.reverse().find(
    (element) => element < totalPrice,
  );

  const rewardsMin = limitProductOne;

  if (totalPrice >= rewardsMin) {
     if (dataProximity) {
      evalAddProduct(objectProduct[dataProximity]);
     }
  } else {
    evalDeleteProduct(objectProduct[rewardsMin]);
  }
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
