#!/usr/bin/env python3
"""MindGarden AI 创意生成器 — 8 种创意工具的 AI 增强版本。

用法:
  python idea_generator.py                          # 交互式菜单
  python idea_generator.py --tool reverse "灵感文本"  # 指定工具
  python idea_generator.py --list                    # 列出所有工具
  python idea_generator.py --tool extreme "灵感" --retry 3 --timeout 30

环境变量:
  API_ENDPOINT   API 端点 (默认 http://localhost:11434/v1/chat/completions)
  API_KEY        API 密钥 (可选)
  API_MODEL      模型名称 (默认 gpt-3.5-turbo)
"""

import argparse
import json
import os
import random
import sys
import time

import requests

# ── API 配置 ──────────────────────────────────────────────
ENDPOINT = os.environ.get("API_ENDPOINT", "http://localhost:11434/v1/chat/completions")
API_KEY = os.environ.get("API_KEY", "")
MODEL = os.environ.get("API_MODEL", "gpt-3.5-turbo")
SSL_VERIFY = os.environ.get("API_SSL_VERIFY", "1") not in ("0", "false", "no", "off")


class APIError(Exception):
    """API 调用错误，包含可重试信息。"""
    def __init__(self, message: str, retryable: bool = True):
        super().__init__(message)
        self.retryable = retryable


def call_api(system_prompt: str, user_prompt: str, timeout: int = 60) -> str:
    """调用 OpenAI 兼容 API，失败时抛出 APIError。"""
    headers = {"Content-Type": "application/json"}
    if API_KEY:
        headers["Authorization"] = f"Bearer {API_KEY}"

    body = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.9,
        "max_tokens": 800
    }

    try:
        resp = requests.post(
            ENDPOINT,
            headers=headers,
            json=body,
            timeout=timeout,
            verify=SSL_VERIFY
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()

    except requests.exceptions.Timeout:
        raise APIError(f"请求超时（{timeout}秒）", retryable=True)
    except requests.exceptions.ConnectionError as e:
        raise APIError(f"无法连接到 API 端点: {ENDPOINT}\n{_conn_hint(e)}", retryable=True)
    except requests.exceptions.HTTPError as e:
        status = e.response.status_code if e.response is not None else "?"
        detail = ""
        if e.response is not None:
            try:
                detail = e.response.text[:300]
            except Exception:
                pass
        retryable = status in (429, 500, 502, 503, 504)
        raise APIError(f"HTTP {status}: {detail}", retryable=retryable)
    except requests.exceptions.RequestException as e:
        raise APIError(f"请求异常: {e}", retryable=False)
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        raise APIError(f"API 响应解析失败: {e}", retryable=False)


def _conn_hint(exc: Exception) -> str:
    """根据连接错误给出排查提示。"""
    msg = str(exc)
    if "SSL" in msg or "ssl" in msg or "certificate" in msg.lower():
        return "提示：如需禁用 SSL 验证，设置环境变量 API_SSL_VERIFY=0"
    if "Connection refused" in msg or "Errno 61" in msg or "Errno 111" in msg:
        return "提示：请确认 API 服务已启动，端点地址是否正确"
    return ""


def call_api_with_retry(system_prompt: str, user_prompt: str,
                        retries: int = 2, timeout: int = 60) -> str:
    """带重试的 API 调用。"""
    last_error = None
    for attempt in range(retries + 1):
        try:
            return call_api(system_prompt, user_prompt, timeout=timeout)
        except APIError as e:
            last_error = e
            if not e.retryable or attempt == retries:
                break
            wait = (attempt + 1) * 2
            print(f"  ⏳ 第 {attempt + 1} 次失败，{wait}秒后重试...", file=sys.stderr)
            time.sleep(wait)
    raise last_error  # type: ignore[misc]


# ── 工具集 ────────────────────────────────────────────────

SYSTEM_BASE = "你是一个创意伙伴，擅长从意想不到的角度激发灵感。回复用中文，保持温暖、有启发性。不要长篇大论，直接给出具体的点子。"


def tool_reverse(inspiration: str, retries: int = 2, timeout: int = 60) -> str:
    """逆向花园：生成失败方案并反转成好点子。"""
    prompt = f"""针对以下灵感，请做两件事：
1. 先列出 3 个「如何把它搞砸」的具体方案
2. 然后把每个搞砸方案反转成一个好点子

灵感：{inspiration}

请这样回复：
【搞砸方案】
- ...
- ...
- ...

【反转后的好点子】
- ...
- ...
- ..."""
    return call_api_with_retry(SYSTEM_BASE, prompt, retries=retries, timeout=timeout)


def tool_scamper(inspiration: str, retries: int = 2, timeout: int = 60) -> str:
    """嫁接实验室：按 SCAMPER 七个维度展开创意。"""
    prompt = f"""针对以下灵感，从 SCAMPER 的七个维度分别给出创意建议：
S-替代：可以用什么代替？
C-组合：能和什么混合？
A-适应：可以借鉴什么？
M-修改：放大/缩小/改变什么？
P-他用：还能做什么别的用途？
E-消除：去掉什么会更好？
R-重排：颠倒顺序会怎样？

灵感：{inspiration}

请每个维度给出一个具体的创意，格式：维度名：具体创意"""
    return call_api_with_retry(SYSTEM_BASE, prompt, retries=retries, timeout=timeout)


def tool_extreme(inspiration: str, condition: str = "",
                 retries: int = 2, timeout: int = 60) -> str:
    """极限温室：在极端条件下生成创意。"""
    conditions = [
        "预算为 0 元", "必须在 10 秒内完成", "在深海中实现",
        "回到童年，用 7 岁的眼光", "只能用一种材料", "在沙漠中",
        "用户是一只猫", "在月球上", "所有东西都要能食用",
        "只能用声音和光线", "在暴风雨中", "为 100 年后的世界设计"
    ]
    cond = condition or random.choice(conditions)

    prompt = f"""在以下极端条件下，这个灵感会发生什么变异？

灵感：{inspiration}
极端条件：{cond}

请给出 3 个具体的创意方案，每个方案要说明在这个条件下会有什么独特的变化。"""
    return call_api_with_retry(SYSTEM_BASE, prompt, retries=retries, timeout=timeout)


def tool_analogy(inspiration: str, retries: int = 2, timeout: int = 60) -> str:
    """自然类比：从自然现象中寻找灵感。"""
    prompt = f"""请从自然界中找 2-3 个现象来类比以下灵感，并说明从中可以获得什么启发。

灵感：{inspiration}

自然界有 38 亿年的智慧积累——蚂蚁的调度、蜘蛛的编织、菌丝的网络、蜜蜂的蜂巢、向日葵的螺旋……
请选择最贴切的自然类比，并具体说明它们之间的联系和启发。"""
    return call_api_with_retry(SYSTEM_BASE, prompt, retries=retries, timeout=timeout)


def tool_first_principles(inspiration: str, retries: int = 2, timeout: int = 60) -> str:
    """本源之土：第一性原理剥洋葱分析。"""
    prompt = f"""请对以下想法进行第一性原理分析，像剥洋葱一样层层深入：

灵感/问题：{inspiration}

请按以下层次分析：
1. 这是什么？用一句话说清本质
2. 拆开来看，由哪些基本元素组成？
3. 哪些是「本质属性」，哪些是「人为附加」的？
4. 去掉人为附加后，剩下的核心是什么？
5. 基于这个核心，可以重新构建什么？"""
    return call_api_with_retry(SYSTEM_BASE, prompt, retries=retries, timeout=timeout)


def tool_pollen(inspiration: str, retries: int = 2, timeout: int = 60) -> str:
    """随机花粉：用随机词汇强行关联。"""
    words = [
        "月亮", "咖啡渍", "旧毛衣", "北极光", "气泡",
        "纸飞机", "回声", "蒲公英", "琥珀", "潮汐",
        "苔藓", "影子", "篝火", "露珠", "风筝线",
        "涟漪", "羽毛", "钟摆", "茧", "漂流瓶",
        "年轮", "雾", "焰火", "漩涡", "结绳",
        "蝉壳", "浮冰", "孔明灯", "沙漏", "罗盘",
        "稗子", "墨迹", "残雪", "萤火虫", "鲸歌"
    ]
    word = random.choice(words)

    prompt = f"""请把以下两个看似无关的概念强行关联起来，催生新的创意：

灵感：{inspiration}
随机词：{word}

请写出 3 个具体的、有趣的关联方式，说明「{word}」和这个灵感如何结合。"""
    return call_api_with_retry(SYSTEM_BASE, prompt, retries=retries, timeout=timeout)


def tool_hats(inspiration: str, retries: int = 2, timeout: int = 60) -> str:
    """六顶思考帽：从六个视角分析。"""
    prompt = f"""请戴上六顶不同颜色的帽子，从六个视角分析以下灵感：

灵感：{inspiration}

白帽子（事实）：关于这个想法，有哪些客观事实和信息？
红帽子（情感）：直觉和情感上，对这个想法有什么感受？
黑帽子（风险）：可能会出什么问题？潜在风险是什么？
黄帽子（价值）：积极面是什么？有什么价值和机会？
绿帽子（创意）：有什么天马行空的新想法和可能性？
蓝帽子（过程）：整体来看，下一步该做什么？

请逐项简洁回答。"""
    return call_api_with_retry(SYSTEM_BASE, prompt, retries=retries, timeout=timeout)


def tool_sandbox(inspiration: str, retries: int = 2, timeout: int = 60) -> str:
    """空想沙盘：自由流动的创意引导。"""
    prompt = f"""请作为创意伙伴，针对以下灵感自由联想和发散。不要结构化的分析，就像和朋友聊天一样，提出 5-8 个跳跃性的、有趣的延伸想法。

灵感：{inspiration}

可以问问题、讲故事、联想到其他领域——让思绪像水一样自由流淌。每个想法 1-2 句话即可。"""
    return call_api_with_retry(SYSTEM_BASE, prompt, retries=retries, timeout=timeout)


# ── 工具注册表 ────────────────────────────────────────────

TOOLS = {
    "reverse":         ("逆向花园", tool_reverse, "先想怎么搞砸，再反转成金点子"),
    "scamper":         ("嫁接实验室", tool_scamper, "SCAMPER 创意模版，七种角度改造灵感"),
    "extreme":         ("极限温室", tool_extreme, "极端条件逼迫非常规创意"),
    "analogy":         ("自然类比", tool_analogy, "向大自然借用智慧"),
    "firstprinciples": ("本源之土", tool_first_principles, "第一性原理剥洋葱，找到根本"),
    "pollen":          ("随机花粉", tool_pollen, "随机词汇强制关联，催生意外灵感"),
    "hats":            ("六顶思考帽", tool_hats, "六种思维视角切换"),
    "sandbox":         ("空想沙盘", tool_sandbox, "自由书写，让思绪流淌"),
}


# ── 命令行接口 ────────────────────────────────────────────

def interactive_mode(retries: int = 2, timeout: int = 60):
    """交互式菜单。"""
    print("\n🌱 MindGarden AI 创意生成器")
    print(f"   模型: {MODEL}  |  端点: {ENDPOINT}")
    print()
    print("可用的创意工具：")
    for i, (key, (name, _, desc)) in enumerate(TOOLS.items(), 1):
        emojis = ["🔄", "🧬", "⚡", "🌿", "🧅", "🌸", "🎩", "🏖️"]
        print(f"  {i}. {emojis[i-1]} {name} — {desc}")

    print("\n输入数字选择工具（输入 q 退出）")

    while True:
        try:
            choice = input("\n> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n再见 🌱")
            break

        if choice.lower() == 'q':
            print("再见 🌱")
            break

        if not choice.isdigit() or int(choice) < 1 or int(choice) > len(TOOLS):
            print("请输入 1-8 之间的数字")
            continue

        key = list(TOOLS.keys())[int(choice) - 1]
        name, func, _ = TOOLS[key]
        inspiration = input("请输入灵感/想法（回车提交）:\n> ").strip()
        if not inspiration:
            print("灵感不能为空")
            continue

        print(f"\n🤔 {name} 正在思考...\n")
        try:
            result = func(inspiration, retries=retries, timeout=timeout)
            print("─" * 50)
            print(result)
            print("─" * 50)
        except APIError as e:
            print(f"❌ {e}", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(
        description="MindGarden AI 创意生成器",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="环境变量: API_ENDPOINT, API_KEY, API_MODEL, API_SSL_VERIFY"
    )
    parser.add_argument("--tool", "-t", choices=list(TOOLS.keys()),
                        help="指定使用的创意工具")
    parser.add_argument("--list", "-l", action="store_true",
                        help="列出所有工具")
    parser.add_argument("--retry", "-r", type=int, default=2,
                        help="失败重试次数（默认 2）")
    parser.add_argument("--timeout", type=int, default=60,
                        help="请求超时秒数（默认 60）")
    parser.add_argument("inspiration", nargs="?", default="",
                        help="灵感文本（如包含空格请用引号）")

    args = parser.parse_args()

    if args.list:
        print("\n可用的创意工具：")
        for key, (name, _, desc) in TOOLS.items():
            print(f"  {key:20s}  {name}  — {desc}")
        return

    if args.tool:
        name, func, _ = TOOLS[args.tool]
        inspiration = args.inspiration
        if not inspiration:
            inspiration = input("请输入灵感/想法: ").strip()
        if not inspiration:
            print("错误：需要提供灵感文本", file=sys.stderr)
            sys.exit(1)

        print(f"\n🤔 {name} 正在思考...\n")
        try:
            result = func(inspiration, retries=args.retry, timeout=args.timeout)
            print(result)
        except APIError as e:
            print(f"❌ {e}", file=sys.stderr)
            sys.exit(1)
    else:
        interactive_mode(retries=args.retry, timeout=args.timeout)


if __name__ == "__main__":
    main()
