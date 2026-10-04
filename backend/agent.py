import os
import argparse
from dotenv import load_dotenv
from langchain_groq import ChatGroq


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


# ============================================================
# DEBATE AGENT
# ============================================================

class DebateAgent:

    def __init__(self, name, position, expertise):

        self.name = name
        self.position = position
        self.expertise = expertise

        # Store all arguments
        self.arguments = []

        # Groq LLM
        self.llm = ChatGroq(
            model="openai/gpt-oss-120b",
            groq_api_key=os.environ.get("GROQ_API_KEY"),
            temperature=0.7
        )

    def make_argument(
        self,
        topic,
        round_number,
        opponent_argument=None
    ):
        """
        Generate an argument for the assigned position.
        """

        system_prompt = f"""
You are {self.name}, an expert debate agent.

Your area of expertise:
{self.expertise}

Your assigned position:
{self.position}

You are participating in a structured multi-round debate.

Your responsibilities:

1. Present a clear and logical argument.
2. Stay focused on the debate topic.
3. Use relevant reasoning and evidence where appropriate.
4. Directly address the opposing argument.
5. Identify weaknesses in the opposing position.
6. Strengthen your own position.
7. Avoid unnecessary repetition.
8. Be professional and respectful.
9. Maintain your assigned position.

IMPORTANT:
Keep your response between 400 and 600 words.
Do not use unnecessary tables or excessive sections.
Focus on the strongest arguments.
"""

        user_prompt = f"""
Debate Topic:
{topic}

Current Round:
{round_number}

Your Position:
{self.position}
"""

        # Give the previous opponent argument to the agent
        if opponent_argument:

            # Prevent huge prompts between agents
            max_opponent_chars = 5000

            if len(opponent_argument) > max_opponent_chars:
                opponent_argument = (
                    opponent_argument[:max_opponent_chars]
                    + "\n[Previous argument truncated]"
                )

            user_prompt += f"""

The opposing agent's previous argument was:

{opponent_argument}

Respond directly to this argument.

Identify its strongest weaknesses,
provide counterarguments,
and strengthen your own position.
"""

        user_prompt += """

Now provide your debate argument.
Keep it focused, logical, and between 400 and 600 words.
"""

        try:

            response = self.llm.invoke(
                [
                    ("system", system_prompt),
                    ("human", user_prompt)
                ]
            )

            argument = response.content

        except Exception as e:

            print(f"\nError generating {self.position} argument:")
            print(e)

            return (
                f"{self.position} agent could not generate "
                f"an argument because of an API error."
            )

        # Save argument
        self.arguments.append(
            {
                "round": round_number,
                "agent": self.name,
                "position": self.position,
                "argument": argument
            }
        )

        return argument


# ============================================================
# AI DEBATE JUDGE
# ============================================================

class DebateJudge:

    def __init__(self):

        # Groq LLM
        self.llm = ChatGroq(
            model="openai/gpt-oss-120b",
            groq_api_key=os.environ.get("GROQ_API_KEY"),
            temperature=0.3
        )

    def evaluate(self, topic, debate_history):
        """
        Evaluate the complete debate.

        A shortened version of the arguments is sent
        to the judge to prevent request-size errors.
        """

        formatted_debate = ""

        for item in debate_history:

            argument = item["argument"]

            # IMPORTANT:
            # Limit the amount of text sent to the judge.
            max_chars = 4000

            if len(argument) > max_chars:

                argument = (
                    argument[:max_chars]
                    + "\n[Argument truncated for evaluation]"
                )

            formatted_debate += f"""
Round {item['round']}

Agent:
{item['agent']}

Position:
{item['position']}

Argument:
{argument}

----------------------------------------
"""

        system_prompt = """
You are an impartial AI debate judge.

Your task is to evaluate a complete multi-round debate objectively.

Evaluate BOTH sides based on:

1. Quality of reasoning
2. Relevance to the topic
3. Strength of arguments
4. Response to opposing arguments
5. Evidence and supporting logic
6. Clarity
7. Logical consistency
8. Overall persuasiveness

Do not judge based on the agent's name.

Judge only the arguments.

Your final evaluation must contain:

1. Winner
2. FOR score out of 100
3. AGAINST score out of 100
4. Strongest FOR argument
5. Strongest AGAINST argument
6. Key insights
7. Final synthesis

Keep the evaluation concise and clear.
"""

        user_prompt = f"""
Debate Topic:

{topic}

Complete Debate:

{formatted_debate}

Evaluate the complete debate objectively.

Provide the final result in a clear format.
"""

        try:

            response = self.llm.invoke(
                [
                    ("system", system_prompt),
                    ("human", user_prompt)
                ]
            )

            return response.content

        except Exception as e:

            print("\nError during AI Judge evaluation:")
            print(e)

            return (
                "The AI Judge could not complete the evaluation "
                "because the Groq API request failed."
            )


# ============================================================
# RUN DEBATE
# ============================================================

def run_debate(topic, rounds=2):

    print("\n")
    print("=" * 70)
    print("MULTI-AGENT DEBATE SYSTEM")
    print("=" * 70)

    print(f"\nTopic: {topic}")
    print(f"Number of rounds: {rounds}")

    # ========================================================
    # CREATE FOR AGENT
    # ========================================================

    pro_agent = DebateAgent(
        name="Dr. Alex Chen",
        position="FOR",
        expertise=(
            "Technology, artificial intelligence, "
            "research, innovation, and future technologies."
        )
    )

    # ========================================================
    # CREATE AGAINST AGENT
    # ========================================================

    con_agent = DebateAgent(
        name="Prof. Sarah Martinez",
        position="AGAINST",
        expertise=(
            "Ethics, social sciences, critical thinking, "
            "risk analysis, and social impact."
        )
    )

    # ========================================================
    # CREATE AI JUDGE
    # ========================================================

    judge = DebateJudge()

    # Complete debate history
    debate_history = []

    # Previous argument
    previous_argument = None

    # ========================================================
    # MULTI-ROUND DEBATE
    # ========================================================

    for round_number in range(1, rounds + 1):

        print("\n")
        print("=" * 70)
        print(f"ROUND {round_number}")
        print("=" * 70)

        # ----------------------------------------------------
        # FOR AGENT
        # ----------------------------------------------------

        print(
            "\n[FOR] Dr. Alex Chen "
            "is preparing an argument..."
        )

        pro_argument = pro_agent.make_argument(
            topic=topic,
            round_number=round_number,
            opponent_argument=previous_argument
        )

        debate_history.append(
            {
                "round": round_number,
                "agent": pro_agent.name,
                "position": pro_agent.position,
                "argument": pro_argument
            }
        )

        print("\n--- FOR ARGUMENT ---")
        print(pro_argument)

        # ----------------------------------------------------
        # AGAINST AGENT
        # ----------------------------------------------------

        print(
            "\n[AGAINST] Prof. Sarah Martinez "
            "is preparing an argument..."
        )

        con_argument = con_agent.make_argument(
            topic=topic,
            round_number=round_number,
            opponent_argument=pro_argument
        )

        debate_history.append(
            {
                "round": round_number,
                "agent": con_agent.name,
                "position": con_agent.position,
                "argument": con_argument
            }
        )

        print("\n--- AGAINST ARGUMENT ---")
        print(con_argument)

        # AGAINST becomes previous argument
        # for FOR in the next round.
        previous_argument = con_argument

    # ========================================================
    # AI JUDGE
    # ========================================================

    print("\n")
    print("=" * 70)
    print("AI JUDGE EVALUATION")
    print("=" * 70)

    print(
        "\nThe AI Judge is evaluating "
        "the complete debate..."
    )

    evaluation = judge.evaluate(
        topic=topic,
        debate_history=debate_history
    )

    print("\n--- FINAL EVALUATION ---")
    print(evaluation)

    print("\n")
    print("=" * 70)
    print("DEBATE COMPLETE")
    print("=" * 70)

    return {
        "topic": topic,
        "rounds": rounds,
        "debate_history": debate_history,
        "evaluation": evaluation
    }


# ============================================================
# MAIN FUNCTION
# ============================================================

def main():

    parser = argparse.ArgumentParser(
        description=(
            "Multi-Agent Debate System "
            "using LangChain and Groq"
        )
    )

    # Debate topic
    parser.add_argument(
        "--topic",
        type=str,
        required=True,
        help="Topic for the debate"
    )

    # Number of rounds
    parser.add_argument(
        "--rounds",
        type=int,
        default=2,
        help="Number of debate rounds (default: 2)"
    )

    args = parser.parse_args()

    # Keep rounds between 1 and 4
    rounds = max(1, min(args.rounds, 4))

    # ========================================================
    # CHECK API KEY
    # ========================================================

    if not os.environ.get("GROQ_API_KEY"):

        print("\nERROR: GROQ_API_KEY is not set.")

        print(
            "\nPlease add your Groq API key "
            "to the environment."
        )

        return

    # ========================================================
    # RUN DEBATE
    # ========================================================

    run_debate(
        topic=args.topic,
        rounds=rounds
    )


# ============================================================
# PROGRAM ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()
