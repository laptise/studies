function makeVariations(arr, elms, targetIndex) {
  return elms.map((elm) => {
    const newArr = [...arr];
    newArr[targetIndex] = elm;
    return newArr;
  });
}

function permutate(elms) {
  let res = [new Array(elms.length).fill(elms[0])];
  for (let i = 0; i < elms.length; i++) {
    res = res.map((toVar) => makeVariations(toVar, elms, i)).reduce((arrs, arr) => [...arrs, ...arr], []);
  }
  return res;
}
console.log(permutate([0, 1, 2]));
