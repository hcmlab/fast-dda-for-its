function countSetBits(num) {
	let count = 0;
	let number = num;
	while (number) {
		count += number & 1;
		number >>= 1;
	}
	return count;
}

function twoDigits(n) {
	return (n <= 9 ? "0" + n : n);
}

function randomPermutation(arr) {
	arr.sort((a, b) => 2 * Math.random() - 1);

	return arr;
}