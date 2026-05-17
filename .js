function longestPalindrome(s: string): string {
    if (s.length < 2) return s;
    let max = "";
    
    for (let i = 0; i < s.length; i++) {
        for (let j = i + 1; j <= s.length; j++) {
            const sub = s.slice(i, j);
            if (sub.length > max.length && isPalindrome(sub)) {
                max = sub;
            }
        }
    }
    return max;
}

function isPalindrome(s: string): boolean {
    let l = 0, r = s.length - 1;
    while (l < r) {
        if (s[l++] !== s[r--]) return false;
    }
    return true;
}
console.log(longestPalindrome("babad")); // "bab" or "aba"
console.log(longestPalindrome("cbbd"));  // "bb"

    
    // Sum the primes
    for (let i = 2; i <= limit; i++) {
        if (isPrime[i]) {
            sum += i;
        }
    }
    
    return sum;
}
console.log(sumPrimes(10)); // 2 + 3 + 5 + 7 = 17
console.log(sumPrimes(20)); // 77




obj = { a: { b: { c: 1 } } }
const proto = Object.getPrototypeOf(obj);
const targetProto = Object.getPrototypeOf(proto);
console.log(targetProto);