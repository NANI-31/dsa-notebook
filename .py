def longest_palindrome(s: str) -> str:
    if len(s) < 2:
        return s

    max_palindrome = ""

    for i in range(len(s)):
        for j in range(i + 1, len(s) + 1):
            sub = s[i:j]

            if len(sub) > len(max_palindrome) and is_palindrome(sub):
                max_palindrome = sub

    return max_palindrome


def is_palindrome(s: str) -> bool:
    l, r = 0, len(s) - 1

    while l < r:
        if s[l] != s[r]:
            return False

        l += 1
        r -= 1

    return True


print(longest_palindrome("babad"))  # "bab" or "aba"
print(longest_palindrome("cbbd"))   # "bb"