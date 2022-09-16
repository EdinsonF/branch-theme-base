import { $Q } from "../utils/query-selector";

/* get all data dom */
const getDataAll = () => {

  if (!$Q('#data-reward')) return;

  const dataAll = $Q('#data-reward');

  return {
    activeRewardOne: dataAll.dataset.activeRewardTwo,
    activeRewardTwo: dataAll.dataset.activeRewardThree,
    limitDiscountOne: dataAll.dataset.amountDiscountOne,
    limitDiscountTwo: dataAll.dataset.amountDiscountTwo,
    limitDiscountThree: dataAll.dataset.amountDiscountThree,
    discountOne: dataAll.dataset.discountOne,
    discountTwo: dataAll.dataset.discountTwo,
    discountThree: dataAll.dataset.discountThree,
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

const percentageBeforeOne = ({totalPrice, limitDiscountOne}) => {

  if (totalPrice <= limitDiscountOne) {
    return calculatePercentageBefore(limitDiscountOne, 13);
  }
}

const percentageBeforeTwo = ({
  totalPrice,
  limitDiscountOne,
  limitDiscountTwo,
}) => {

  if ((totalPrice > limitDiscountOne) && (totalPrice <= limitDiscountTwo)) {
    return calculatePercentageBefore(limitDiscountTwo, 50);
  }
}

const percentageBeforeThree = ({
  totalPrice,
  limitDiscountTwo,
  limitDiscountLast: limitDiscountThree,
}) => {

  if ((totalPrice > limitDiscountTwo) && (totalPrice < limitDiscountThree)) {
    return calculatePercentageBefore(limitDiscountThree, 88);
  }
}

const getPercentageBefore = ({
  totalPrice,
  limitDiscountOne,
  limitDiscountTwo,
  limitDiscountLast,
}) => {
  /* all rewards */

    const evalPercentageBefore = {
      13: percentageBeforeOne,
      50: percentageBeforeTwo,
      88: percentageBeforeThree,
    }

    const keyArr = Object.keys(evalPercentageBefore);

    const elementResult = keyArr.map((element) => {
    const rs = evalPercentageBefore[element]({
      totalPrice,
      limitDiscountOne,
      limitDiscountTwo,
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

const percentageAfterOne = ({
  totalPrice,
  limitDiscountOne,
  limitDiscountTwo,
  percentageAfter,
}) => {

  if (
    (totalPrice > limitDiscountOne)
    &&
    (totalPrice <= limitDiscountTwo)
    &&
    (percentageAfter < 13)) {
    return 20;
  }

}

const percentageAfterTwo = ({
  totalPrice,
  limitDiscountTwo,
  percentageAfter,
  limitDiscountThree,
}) => {
  if (
    (totalPrice > limitDiscountTwo)
    &&
    (totalPrice < limitDiscountThree)
    &&
    (percentageAfter < 50)) {
    return 53;
  }
}

const percentageAfterThree = ({
  totalPrice,
  percentageAfter,
  limitDiscountThree,
}) => {
  if ((totalPrice >= limitDiscountThree) && (percentageAfter < 88)) {
    return 100;
  }
}

/**
 * calculate percentage after break rewards
 * @param {number} percentageAfter - value percentage after dots break
 * @param {number} totalPrice - price cart total
 * @param {number} limitDiscountTwo - limit product two rewards
 */
 const calculatePercentageAfter = (
  percentageAfter,
  totalPrice,
  limitDiscountThree,
) => {

  const {
    limitDiscountOne,
    limitDiscountTwo,
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
      limitDiscountOne,
      percentageAfter,
      limitDiscountTwo,
      limitDiscountThree,
    }),
  )

  if (resultPercentage.length > 0) {
    return resultPercentage[0]
  }

  return percentageAfter;
}

const isRewardOneOrTwoActive = (
  activeRewardOne,
  limitDiscountOne,
  limitDiscountTwo,
) => (
  activeRewardOne === 'true' ? limitDiscountOne : limitDiscountTwo
)
/**
 * validate las rewards active
 * @param {boolean} activeRewardOne - true or false reward one
 * @param {boolean} activeRewardTwo - true or false reward two
 * @param {number} limitDiscountOne - limint reward one
 * @param {numeber} limitDiscountTwo - limint reward two
 */
 const productsIsRewardsActive = ({
  activeRewardOne,
  activeRewardTwo,
  limitDiscountTwo,
  limitDiscountThree,
}) => {
  if (
    ((activeRewardOne === 'true') && (activeRewardTwo === 'false'))
    ||
    ((activeRewardOne === 'false') && (activeRewardTwo === 'true'))) {
      return isRewardOneOrTwoActive(
        activeRewardOne,
        limitDiscountTwo,
        limitDiscountThree,
      )
    }

    return limitDiscountThree;

}

/**
 * get percentage whent more one rewards is active
 * @param {Object} {Object} - data params rewards
 * @param {Number} totalPrice - total cart
 */
const calculateMoreOneRewards = (
  {
    activeRewardOne,
    activeRewardTwo,
    limitDiscountOne,
    limitDiscountTwo,
    limitDiscountThree,
  },
  totalPrice,
) => {
  const limitDiscountLast = productsIsRewardsActive({
    activeRewardOne,
    activeRewardTwo,
    limitDiscountTwo,
    limitDiscountThree,
  });

  const percentageBefore = getPercentageBefore({
    totalPrice,
    limitDiscountOne,
    limitDiscountTwo,
    limitDiscountLast,
  });

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
    limitDiscountOne,
  } = getDataAll();

  /* active one first reward */
  if (activeRewardOne === 'false' && activeRewardTwo === 'false') {
    return (totalPrice / limitDiscountOne) * 100;
  }

  return calculateMoreOneRewards(getDataAll(), totalPrice)
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
    limitDiscountOne,
    limitDiscountTwo,
    limitDiscountThree,
  } = getDataAll();

  const pointUnique = $Q('.point-unique');
  const pointProductOne = $Q('.point-product-one');
  const pointProductTwo = $Q('.point-product-two');

  const isLimitOne = limitDiscountOne <= totalPrice;
  const isLimitTwo = limitDiscountTwo <= totalPrice;
  const isLimitThree = limitDiscountThree <= totalPrice;

  if (pointUnique) pointChangeColor(pointUnique, isLimitOne);
  if (pointProductOne) pointChangeColor(pointProductOne, isLimitTwo);
  if (pointProductTwo) pointChangeColor(pointProductTwo, isLimitThree);

}

/**
 * Object rewards position order
 */
 const objectDataRewards = () => {
  const {
    discountOne,
    discountTwo,
    discountThree,
    limitDiscountOne,
    limitDiscountThree,
    limitDiscountTwo,
    activeRewardOne,
    activeRewardTwo,
  } = getDataAll();

  const objectProduct = {
    [limitDiscountOne]: [limitDiscountOne, [discountOne]],
    ...(activeRewardOne === 'true' && {
      [limitDiscountTwo]: [limitDiscountTwo, [discountTwo]],
    }),
    ...(activeRewardTwo === 'true' && {
      [limitDiscountThree]: [limitDiscountThree, [ discountThree]],
    }),
  }
  return objectProduct;
}

const getDataProximity = (objectProduct, totalPrice) => {

  const objectArr = Object.keys(objectProduct);

  return objectArr.reverse().find(
    (element) => element < totalPrice);
}

/**
 * add discount reward or deleted in cart
 * @param {string} code - code discount
 */
 const discountRewardSend = async (code) => {

  $Q('#code-discount').value = code;
}

/**
 * eval discount rewards or add or delete
 * @param {array} data - data product rewards
 * @param {number} totalPrice - total cart
 */
 const evalAddDiscount = (data, totalPrice) => {

  if (!$Q('#code-discount')) return;
  /* if > limit rewards current */
  if (totalPrice >= data[0]) {

    if ($Q('#code-discount').value !== data[1][0]) discountRewardSend(data[1][0])
  }
}

/**
 * eval object product rewards
 * @param {number} totalPrice - total cart
 */
 const validateProductsRewards = (totalPrice) => {

  const {
    limitDiscountOne,
  } = getDataAll();

  const objectProduct = objectDataRewards()

  const dataProximity = getDataProximity(objectProduct, totalPrice)

  const rewardsMin = limitDiscountOne;

  if (totalPrice >= rewardsMin) {
    if (dataProximity) {
      evalAddDiscount(objectProduct[dataProximity], totalPrice);
    }
  } else {
    $Q('#code-discount').value = '';
  }
}

/**
 * Update the width of bar reward
 * @param {DOM element} input - input hidde with data
 */
export const barProgressReward = (input) => {

  if ($Q('#is-show-rewards').dataset.activeRewards === 'false') return;

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
