def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

import sys
input_data = sys.stdin.read().strip().split('\n')
if len(input_data) >= 2:
    nums = list(map(int, input_data[0].strip().split()))
    target = int(input_data[1].strip())
    result = two_sum(nums, target)
    if isinstance(result, list):
        print(" ".join(map(str, sorted(result))))
    else:
        print("")