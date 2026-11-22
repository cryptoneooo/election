#!/usr/bin/env python3
"""Second pass: fix remaining speech recognition errors missed in first round."""
import json

with open('src/data/election_data.json', 'r') as f:
    data = json.load(f)

# Build paragraph -> index mapping
p_to_idx = {}
for i, t in enumerate(data['transcript_ledger']):
    p = t.get('paragraph', 0)
    if isinstance(p, (int, float)):
        p_to_idx[int(p)] = i

fix_count = 0

def fix(pnum, old, new):
    global fix_count
    if pnum not in p_to_idx:
        print(f"WARNING: P{pnum} not found")
        return
    idx = p_to_idx[pnum]
    text = data['transcript_ledger'][idx]['raw_text']
    if old in text:
        data['transcript_ledger'][idx]['raw_text'] = text.replace(old, new)
        fix_count += 1
    else:
        print(f"  NOT FOUND in P{pnum}: '{old}'")

# ========== Remaining fixes ==========

# P80: second instance of 李毅廉恥 (first was fixed, second wasn't)
fix(80, '讓李毅廉恥重現', '讓禮義廉恥重現')

# P150: 花言次序 -> 發言次序 (花言 variant not caught by global)
fix(150, '花言次序', '發言次序')

# P168: 新電 -> 新店 (this is c05's paragraph, global only fixed c02)
fix(168, '新電有更好的未來', '新店有更好的未來')

# P246: 進腦卡 -> 敬老卡 (missed in first round)
fix(246, '進腦卡擴大', '敬老卡擴大')

# P248: second 進腦卡 instance
fix(248, '進腦卡可以擴大', '敬老卡可以擴大')

# P258: 醫療性動亂 -> 醫療性凍卵 (was targeted at P260 but text is in P258)
fix(258, '醫療性動亂', '醫療性凍卵')
# P258: 期願源 -> 祈願
fix(258, '期願源讓女性', '祈願讓女性')

# P260: 生產準備價 -> 生產準備假 (check if still needed)
fix(260, '生產準備價', '生產準備假')

# P272: 屋來 -> 烏來
fix(272, '坪林屋來', '坪林烏來')

# P296: 花妍次系 -> 發言次序
fix(296, '花妍次系', '發言次序')

# P406: 流公圳 -> 柳公圳
fix(406, '流公圳', '柳公圳')

# P240: 中校園里長 -> 中正里的里長 (he's 中正里里長 per P206)
fix(240, '皓麟中校園里長', '皓麟中正里的里長')

# P252: 鞏大 -> 衝勁 (context: 帶著一股為家鄉做事的X)
fix(252, '一股為家鄉做事的鞏大', '一股為家鄉做事的衝勁')

# P252: 正餐 -> 選戰 (context: 投入X為民服務)
fix(252, '投入正餐為民服務', '投入選戰為民服務')

# P304: 五省的 -> 議會的 (already fixed? check)
# P304: 無人機的教育去巡迴 -> OK as-is

# P328: 建安康 -> context suggests 安康
fix(328, '透過我們來檢討安康的都市計畫通常檢討因為現在安康地區有一些老社區', '透過我們來檢討安康的都市計畫來檢討因為現在安康地區有一些老社區')
# P328: 建幣率 -> 建蔽率
fix(328, '容積率建幣率', '容積率建蔽率')

# P330: 深煤 -> 深美 (deep美 substation, check if already fixed)
fix(330, '深煤變電廠', '深美變電廠')

# P342: 原而編制 -> 員額編制
fix(342, '教師員原而編制正式的原而編制', '教師員額編制正式的員額編制')

# P344: 終點費 -> 鐘點費 (check if previous fix applied)
# Already fixed in first pass, skip

# P378: 新電線 -> 新店線 (MRT line name)
fix(378, '捷運的新電線', '捷運的新店線')
# P378: 下十處 -> 下石措 (place name) - actually keep as-is, it's a place
# Actually "下十處" should be "下城" or similar. The text says "下石措地區" in P374.
# Let me fix P374 too
fix(374, '下石措地區', '下城地區')

# P392/394: 園址 -> 原址 (check if already fixed)
# Already fixed in first pass

# P398: 新店 check - already fixed from 新竹
# Already fixed

# P8: 聯繫暢明三次能為上臺者 -> this was targeted but let me check
# Already fixed in first pass

# P36: 個人陳年資料 -> already targeted, check
# The targeted fix was wrong - let me look at current text
# P36 current: "個人隱私資料受到保護" - already fixed

# P276: c07 安坑運動中心 section - mostly clean

# P282: 家權 -> 加權 (already fixed)
# Check: "里基層經費也應該要納入偏鄉加權的概念" - looks fixed

# P284: 公車站家住人權博物館 -> already fixed to 更名為人權博物館站
# Check current: "推動國家人權博物館公車站更名為人權博物館站" - fixed

# P340: 奉派人席 -> 奉派研習 (check if fixed)
# Current: "奉派研習" - already fixed

# P314: 賣店 -> should this be 店鋪? Looking at context "特色的一些有創意的這些賣店"
# Actually 賣店 could be a valid term in this context. Let me leave it.

# P320: 行行運動 -> 行政運動 (check)
# Current: "行政運動" - already fixed

# P308: c06's 特工盟 -> 特公盟 (check)
# Current: "特公盟" - already fixed

# P256: 輪撞病毒 -> 輪狀病毒 (check)
# Current: "輪狀病毒" - already fixed

print(f"\nApplied {fix_count} fixes in second pass")

# ========== Rebuild transcript_text for all policies ==========
p_texts = {}
for t in data['transcript_ledger']:
    p = t.get('paragraph', 0)
    if isinstance(p, (int, float)):
        p_texts[int(p)] = t['raw_text']

for policy in data['policies']:
    tp = policy.get('transcript_paragraphs', [])
    if tp:
        texts = [p_texts[pnum] for pnum in tp if pnum in p_texts]
        policy['transcript_text'] = '\n\n'.join(texts)
    else:
        policy['transcript_text'] = ''

print("Rebuilt transcript_text for all policies")

with open('src/data/election_data.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Saved!")
