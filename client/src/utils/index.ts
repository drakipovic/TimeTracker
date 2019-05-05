export const isNumber = (value: string | number): boolean => {
  return !isNaN(Number(value.toString()));
};

export const appendLeadingZeroes = (n: number) => {
  if(n < 9){
    return "0" + n;
  }
  return n
}