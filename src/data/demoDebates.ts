import { DebatePreset } from '../types/debate';

export const DEMO_PRESETS: DebatePreset[] = [
  {
    id: 'rust-microservices',
    title: 'Python to Rust Backend Migration',
    category: 'Engineering',
    question: 'Should we rewrite our latency-sensitive backend microservices from Python to Rust?',
    context: 'Our real-time analytics and transaction pipelines are experiencing tail-latency spikes during peak traffic. The current team is highly proficient in Python, with only 2 engineers having prior production experience in Rust.',
    criteria: 'System throughput, p99 latency guarantees, engineering velocity over the next 6-12 months, and hiring friction.',
    rounds: 3,
    expectedVerdict: 'Conditional',
    confidence: 84,
    transcript: [
      // Round 1
      {
        id: 'r1-mod-q',
        round: 1,
        agentRole: 'moderator',
        agentName: 'Moderator',
        kind: 'moderator_question',
        title: 'Round 1 Inquiry: Latency Bottlenecks vs Team Velocity',
        content: 'To open this debate, both agents must address the root cause of the current latency spikes. Is the tail latency primarily bounded by CPU memory overhead and the GIL in Python, or by external network I/O and database queries? Pro, establish the performance imperative. Con, address the organizational execution cost.',
        targetedAgent: 'both',
        timestamp: 'Round 1 · Turn 1',
      },
      {
        id: 'r1-pro-1',
        round: 1,
        agentRole: 'pro',
        agentName: 'Pro Agent',
        kind: 'argument',
        title: 'Predictable P99 Latency and Memory Safety at Scale',
        content: 'Migrating the top 2 latency-critical services to Rust directly addresses our core bottleneck: garbage collection pauses and GIL contention under high-concurrency workloads. Rust provides zero-cost abstractions, deterministic resource management without a garbage collector, and memory safety without sacrificing raw throughput. By tackling the microservices that process over 60% of request volume, we can reduce our p99 latency from over 380ms down to sub-30ms, while significantly decreasing AWS EC2 compute footprints.',
        keyPoints: [
          'Deterministic sub-millisecond execution without GC pauses',
          'Eliminates Python GIL concurrency bottlenecks',
          'Estimated 40-60% cloud infrastructure compute cost reduction'
        ],
        timestamp: 'Round 1 · Turn 2',
      },
      {
        id: 'r1-con-1',
        round: 1,
        agentRole: 'con',
        agentName: 'Con Agent',
        kind: 'argument',
        title: 'Severe Velocity Tax and Steep Learning Curve',
        content: 'Pro presents a textbook performance argument while ignoring our operational reality: only 2 out of 14 backend engineers know Rust. The borrow checker learning curve will reduce team delivery velocity by an estimated 50% for at least two quarters. Furthermore, profiling indicates that 65% of our p99 latency stems from inefficient database indexing and synchronous third-party API calls, not Python runtime overhead. We risk spending six months on a risky rewrite that fixes the wrong bottleneck.',
        keyPoints: [
          'Team knowledge deficit: 85% of engineers must climb the Rust learning curve',
          'Database query optimization and caching could solve p99 without rewriting codebases',
          'Prolonged feature freeze while product roadmap competitors advance'
        ],
        timestamp: 'Round 1 · Turn 3',
      },
      {
        id: 'r1-mod-sum',
        round: 1,
        agentRole: 'moderator',
        agentName: 'Moderator',
        kind: 'round_summary',
        title: 'Round 1 Synthesis',
        content: 'Round 1 establishes a sharp tension between absolute execution efficiency and team delivery velocity. Pro established the architectural ceiling of Rust for high concurrency, while Con highlighted the risk of rewriting before exhausting query optimization and caching. In Round 2, we will focus on incremental migration patterns versus whole-cloth rewrites.',
        timestamp: 'Round 1 · Summary',
      },

      // Round 2
      {
        id: 'r2-mod-q',
        round: 2,
        agentRole: 'moderator',
        agentName: 'Moderator',
        kind: 'moderator_question',
        title: 'Round 2 Inquiry: Incremental FFI vs Complete Service Isolation',
        content: 'Rather than a binary choice between doing nothing and rewriting entire services, could hybrid approaches (such as PyO3 native extensions or isolating a single stateless hot path) deliver the required throughput with lower organizational risk? Pro, respond to the query optimization challenge. Con, evaluate whether a targeted pilot reduces your concerns.',
        targetedAgent: 'both',
        timestamp: 'Round 2 · Turn 1',
      },
      {
        id: 'r2-pro-2',
        round: 2,
        agentRole: 'pro',
        agentName: 'Pro Agent',
        kind: 'argument',
        title: 'Targeted Migration via PyO3 or Single Ingestion Gateway',
        content: 'We do not propose rewriting all 18 backend services. We propose isolating the single ingestion gateway handling raw packet parsing and serialization. By rewriting this standalone service in Rust and using PyO3 bindings for internal processing, the rest of the business logic remains in Python. The two experienced Rust engineers can establish idioms, linting pipelines, and pair-program with the team, turning this into an internal capability builder rather than a blind leap.',
        keyPoints: [
          'Bounded scope: isolate the single packet-parsing ingestion service',
          'Utilize PyO3 bindings to bridge existing Python business workflows',
          'Paired engineering reduces learning ramp time and preserves roadmap progress'
        ],
        timestamp: 'Round 2 · Turn 2',
      },
      {
        id: 'r2-con-2',
        round: 2,
        agentRole: 'con',
        agentName: 'Con Agent',
        kind: 'argument',
        title: 'Polyglot Overhead and Maintenance Fragmentation',
        content: 'Introducing a second production runtime creates a permanent polyglot tax. We will need dual CI/CD pipelines, dual security vulnerability scanners, separate telemetry standards, and fragmented on-call rotas. If only 2 engineers truly master Rust, they become a permanent single point of failure on critical path incidents. If we first optimize database connection pooling and adopt asynchronous Python (uvloop / FastAPI), we can achieve 70% of the needed headroom without fracturing the engineering stack.',
        keyPoints: [
          'Polyglot operational debt: duplicated CI/CD, linting, and vulnerability scanning',
          'Critical on-call bus factor centered on just two team members',
          'Python async optimizations with uvloop can reclaim substantial throughput immediately'
        ],
        timestamp: 'Round 2 · Turn 3',
      },
      {
        id: 'r2-mod-sum',
        round: 2,
        agentRole: 'moderator',
        agentName: 'Moderator',
        kind: 'round_summary',
        title: 'Round 2 Synthesis',
        content: 'Pro has narrowed the proposal to a single gateway service with paired programming. Con has countered with the operational cost of a polyglot stack and the bus factor risk. Round 3 will determine the definitive decision framework and threshold criteria for the Judge.',
        timestamp: 'Round 2 · Summary',
      },

      // Round 3
      {
        id: 'r3-mod-q',
        round: 3,
        agentRole: 'moderator',
        agentName: 'Moderator',
        kind: 'moderator_question',
        title: 'Round 3 Final Examination: Definitive Metrics and Exit Criteria',
        content: 'Both agents must present their final summary: what concrete metric threshold justifies proceeding or stopping, and what is the contingency if the migration encounters friction? Provide your closing arguments.',
        targetedAgent: 'both',
        timestamp: 'Round 3 · Turn 1',
      },
      {
        id: 'r3-pro-3',
        round: 3,
        agentRole: 'pro',
        agentName: 'Pro Agent',
        kind: 'argument',
        title: 'Closing: Strategic Future-Proofing for 10x Scale',
        content: 'Our transaction volume is projected to quadruple over the next 18 months. Python async optimizations offer diminishing returns and will only postpone the architectural limit by 3 to 4 months. By migrating the ingestion gateway now with a strict 60-day evaluation gate, we solve the p99 problem permanently, lower infrastructure spend, and equip our team with modern systems engineering skills.',
        keyPoints: [
          'Python async yields temporary gains that will cap out within two quarters',
          'Ingestion gateway has clean API contracts, minimizing blast radius',
          'Definitive 60-day pilot gate ensures objective rollback capability'
        ],
        timestamp: 'Round 3 · Turn 2',
      },
      {
        id: 'r3-con-3',
        round: 3,
        agentRole: 'con',
        agentName: 'Con Agent',
        kind: 'argument',
        title: 'Closing: Exhaust Existing Headroom Before Introducing Complexity',
        content: 'Engineering excellence means choosing the least complex architecture that reliably satisfies SLAs. Before committing $150k+ in engineering hours to a Rust rewrite, we must mandate a 2-week sprint focused on database indexes, connection pooling, and payload compression. If that fails to bring p99 within acceptable bounds, only then should a sandboxed Rust pilot be permitted.',
        keyPoints: [
          'Principle of least complexity: exhaust profiling and indexing first',
          'Premature architectural rewrites frequently stall business roadmaps',
          'Benchmark existing stack headroom before introducing a second runtime'
        ],
        timestamp: 'Round 3 · Turn 3',
      },
      {
        id: 'r3-mod-sum',
        round: 3,
        agentRole: 'moderator',
        agentName: 'Moderator',
        kind: 'round_summary',
        title: 'Final Debate Synthesis & Referral to Judge',
        content: 'The 3-round debate concludes. Pro has demonstrated that high-throughput packet processing is fundamentally bottlenecked by Python runtime mechanics at scale. Con has demonstrated that whole-cloth rewrites pose severe organizational and on-call risks given current team seniority. Handing over to the Judge for objective verdict evaluation.',
        timestamp: 'Round 3 · Final Summary',
      },
    ],
    verdict: {
      verdict: 'Conditional',
      confidence: 84,
      summary: 'Approve a strictly bounded pilot rewrite for the high-volume ingestion gateway only, contingent on prior query profiling and explicit on-call enablement.',
      decidingFactors: [
        'Ingestion gateway has cleanly decoupled boundary interfaces, isolating failure risk',
        'Projected 4x traffic scale cannot be sustained by Python runtime memory mechanics long-term',
        'A full-system rewrite was decisively rejected in favor of an isolated microservice pilot',
        'Bus factor of 2 engineers is unacceptable without formal knowledge-transfer pairs'
      ],
      risks: [
        'Single point of failure on Rust code reviews and incident response',
        'Tooling fragmentation across CI/CD, telemetry, and dependency auditing',
        'Risk that p99 latency is masked by downstream database bottlenecks'
      ],
      reasoning: 'The debate demonstrated that while the performance ceiling of Rust is required for high-throughput packet ingestion, the Con agent successfully proved that an unrestricted rewrite across multiple services would derail team delivery. A conditional verdict bridges both positions: author a 4-week pilot on the single ingestion gateway, mandate 2 weeks of baseline database query profiling first, and require 2 additional engineers to complete Rust code pairing before promoting to production traffic.',
      actionableRecommendations: [
        'Execute a 2-week performance audit on database indexing and connection pooling to establish true runtime baseline.',
        'Confine the Rust rewrite strictly to the edge ingestion service with zero shared mutable state.',
        'Pair each experienced Rust developer with one Python developer during the implementation sprint.',
        'Establish automated rollback criteria if p99 latency does not improve by at least 60% in staging benchmarks.'
      ],
      voteBreakdown: {
        proStrength: 52,
        conStrength: 48
      }
    }
  },
  {
    id: 'soc2-launch',
    title: 'Enterprise Launch Ahead of SOC 2 Certification',
    category: 'Security',
    question: 'Should we launch our enterprise tier to unblock pending customer contracts before receiving our final SOC 2 Type II audit report?',
    context: 'We have three prospective enterprise deals worth $420k ARR requesting access this quarter. Our SOC 2 Type II audit period finishes in 6 weeks, with final report issuance expected 4 weeks thereafter. Legal and sales are in disagreement.',
    criteria: 'Contractual liability, customer trust, revenue acceleration, and compliance exposure.',
    rounds: 2,
    expectedVerdict: 'No',
    confidence: 92,
    transcript: [
      {
        id: 'r1-mod-q-soc',
        round: 1,
        agentRole: 'moderator',
        agentName: 'Moderator',
        kind: 'moderator_question',
        title: 'Round 1 Inquiry: Contractual Commitments vs Audit Timeline',
        content: 'This decision hinges on legal risk versus commercial timing. Can we sign enterprise deals with contractual caveats or bridge letters, or does premature deployment invalidate security representations? Pro and Con, define the balance of risk.',
        targetedAgent: 'both',
        timestamp: 'Round 1 · Turn 1',
      },
      {
        id: 'r1-pro-soc',
        round: 1,
        agentRole: 'pro',
        agentName: 'Pro Agent',
        kind: 'argument',
        title: 'Capture $420k ARR with Structured Bridge Letters and Sandbox Pilots',
        content: 'Enterprise sales cycles take 6 to 9 months; delaying these three ready buyers means missing our Q4 board milestone and risking deal slippage into next fiscal year. We can issue formal SOC 2 Type II "In-Progress Bridge Letters" signed by our auditor confirming our observation window has completed without exceptions. Furthermore, we can deploy customers to dedicated, isolated single-tenant environments under a mutual trial addendum, protecting both revenue and legal exposure.',
        keyPoints: [
          'Secures $420k in high-margin enterprise ARR ahead of fiscal close',
          'Auditor bridge letter certifies zero exceptions during observation window',
          'Single-tenant sandbox deployment mitigates multi-tenant data bleed risks'
        ],
        timestamp: 'Round 1 · Turn 2',
      },
      {
        id: 'r1-con-soc',
        round: 1,
        agentRole: 'con',
        agentName: 'Con Agent',
        kind: 'argument',
        title: 'Catastrophic Breach of Warranty and Long-Term Brand Liability',
        content: 'Pro is recommending a dangerous regulatory shortcut. Enterprise Master Service Agreements (MSAs) require explicit warranties of SOC 2 compliance. If an unexpected exception surfaces in the auditor review during the final 4-week packaging period, we will have signed contracts with false security warranties. That triggers breach of contract, indemnity penalties, and permanent vendor disqualification. A bridge letter is not an attestation report; enterprise Infosec teams will reject it upon formal vendor risk review.',
        keyPoints: [
          'False security representations in signed enterprise MSAs trigger breach clauses',
          'Auditor bridge letters do not replace formal Type II attestation reports',
          'Failed vendor security review creates long-term reputational blacklisting'
        ],
        timestamp: 'Round 1 · Turn 3',
      },
      {
        id: 'r1-mod-sum-soc',
        round: 1,
        agentRole: 'moderator',
        agentName: 'Moderator',
        kind: 'round_summary',
        title: 'Round 1 Synthesis',
        content: 'Pro argues that financial momentum and bridge letters suffice for trial pilots. Con argues that legal warranties and auditor uncertainties make signing enterprise MSAs an existential liability. In Round 2, focus on whether non-production pilots offer a safe middle path.',
        timestamp: 'Round 1 · Summary',
      },
      {
        id: 'r2-mod-q-soc',
        round: 2,
        agentRole: 'moderator',
        agentName: 'Moderator',
        kind: 'moderator_question',
        title: 'Round 2 Inquiry: Pilot Sandboxes vs Full Production Entitlement',
        content: 'Can the company sign letters of intent (LOIs) with pre-paid implementation fees while strictly withholding production data ingestion until report issuance? Deliver your final recommendations.',
        targetedAgent: 'both',
        timestamp: 'Round 2 · Turn 1',
      },
      {
        id: 'r2-pro-soc-2',
        round: 2,
        agentRole: 'pro',
        agentName: 'Pro Agent',
        kind: 'argument',
        title: 'Execute Conditional Contracts with Delayed Data Provisioning',
        content: 'We can satisfy both objectives by executing the contracts today with an explicit "Compliance Effective Date" tied to the report delivery date. This legally commits the ARR, allows customer engineering teams to begin API sandbox integrations with synthetic test data, and withholds production sensitive data until the ink is dry on the final auditor report.',
        keyPoints: [
          'Contracts signed with contingent compliance effective date',
          'Integration begins on synthetic data in isolated sandbox environments',
          'Zero production sensitive customer data stored prior to report delivery'
        ],
        timestamp: 'Round 2 · Turn 2',
      },
      {
        id: 'r2-con-soc-2',
        round: 2,
        agentRole: 'con',
        agentName: 'Con Agent',
        kind: 'argument',
        title: 'Premature Launch Signals Compliance Laxity to Tier-1 Buyers',
        content: 'The question specifically asked whether to launch the enterprise tier, not whether to sign sandboxed LOIs. Launching the tier publicly implies general availability and certified posture. If enterprise security teams see us advertising an enterprise tier without the formal badge, it raises red flags about our compliance rigor. We must delay general launch by 10 weeks and handle these 3 prospects strictly through private security-cleared pre-commitments.',
        keyPoints: [
          'Public tier launch creates misperception of full SOC 2 certification',
          'Enterprise infosec teams demand final signed reports before security signoff',
          'Premature launch risks customer audits that find work-in-progress controls'
        ],
        timestamp: 'Round 2 · Turn 3',
      },
      {
        id: 'r2-mod-sum-soc',
        round: 2,
        agentRole: 'moderator',
        agentName: 'Moderator',
        kind: 'round_summary',
        title: 'Final Synthesis for Judge',
        content: 'The core risk is public tier launch versus private customer engagement. Con has effectively demonstrated that a public general availability launch prior to report receipt exposes the company to severe legal and reputational hazards.',
        timestamp: 'Round 2 · Final Summary',
      },
    ],
    verdict: {
      verdict: 'No',
      confidence: 92,
      summary: 'Do not launch the enterprise tier publicly prior to final SOC 2 Type II report receipt; preserve sales momentum strictly via non-production sandbox agreements.',
      decidingFactors: [
        'Master Service Agreement security warranties cannot be legally satisfied without the signed final audit report',
        'Public launch claims without attestation expose the firm to false advertising and infosec audit disqualification',
        'The 10-week window until report finalization is manageable via private contingent purchase orders',
        'Breach of security warranty damages far outweigh the one-quarter revenue acceleration'
      ],
      risks: [
        'Potential slip of one or two enterprise deals into the following quarter',
        'Sales team commission friction regarding quarterly quota attainment',
        'Competitors leveraging their existing SOC 2 badge in competitive bake-offs'
      ],
      reasoning: 'The Con agent presented an airtight legal and brand reputation defense. In enterprise software, security compliance is a trust prerequisite; certifying compliance before receiving the signed auditor attestation is an unacceptable existential risk. While the 3 prospects may participate in non-production sandbox evaluations with synthetic data, the enterprise tier itself must not be launched or certified for production data until the final report is in hand.',
      actionableRecommendations: [
        'Offer the three pending prospects pre-commitment contracts featuring contingent payment terms tied to final SOC 2 delivery.',
        'Grant sandboxed sandbox API access using synthetic test datasets only; strictly prohibit live customer PII.',
        'Keep enterprise tier marketing in "Early Access Preview" status on the website.',
        'Establish direct communication between the compliance lead and the prospect Infosec reviewers.'
      ],
      voteBreakdown: {
        proStrength: 28,
        conStrength: 72
      }
    }
  },
  {
    id: 'four-day-week',
    title: 'Transition Engineering to 4-Day Work Week',
    category: 'Strategy',
    question: 'Should our 35-person engineering organization transition to a 32-hour, 4-day work week (Monday–Thursday)?',
    context: 'Senior engineers are reporting increased fatigue from on-call rotas and continuous context switching. We operate 24/7 client-facing SaaS with a 99.9% uptime SLA.',
    criteria: 'Sprint delivery velocity, on-call coverage integrity, talent retention, and customer SLA compliance.',
    rounds: 2,
    expectedVerdict: 'Yes',
    confidence: 81,
    transcript: [
      {
        id: 'r1-mod-q-4d',
        round: 1,
        agentRole: 'moderator',
        agentName: 'Moderator',
        kind: 'moderator_question',
        title: 'Round 1 Inquiry: Velocity vs System Reliability Coverage',
        content: 'Does a 4-day work week decrease overall team output, or does recovery time eliminate Parkinson’s law and reduce burnout? Pro, demonstrate productivity dynamics. Con, address 24/7 on-call coverage on Fridays and weekends.',
        targetedAgent: 'both',
        timestamp: 'Round 1 · Turn 1',
      },
      {
        id: 'r1-pro-4d',
        round: 1,
        agentRole: 'pro',
        agentName: 'Pro Agent',
        kind: 'argument',
        title: 'Higher Focus Density, Drastic Burnout Reduction, and Elite Recruiting Advantage',
        content: 'Engineering output is not linear with hours seated; it is bounded by cognitive endurance and focus. By transitioning to a 32-hour schedule, we force the elimination of low-value meetings, shorten standups, and establish deep focus blocks. Documented trials across peer software firms demonstrate that sprint velocity remains neutral or improves due to decreased defect rates and lower context switching. Moreover, it becomes our number one hiring and retention magnet in a competitive engineering market.',
        keyPoints: [
          'Dramatically reduces costly senior developer turnover and mental fatigue',
          'Forces organizational hygiene: meeting cutbacks and async-first communication',
          'Massive recruitment differentiator without requiring base salary hikes'
        ],
        timestamp: 'Round 1 · Turn 2',
      },
      {
        id: 'r1-con-4d',
        round: 1,
        agentRole: 'con',
        agentName: 'Con Agent',
        kind: 'argument',
        title: 'Critical SLA Vulnerability on Fridays and Cross-Functional Friction',
        content: 'Pro is neglecting the operational surface of a 24/7 SaaS with enterprise SLAs. If engineering is offline on Friday, who responds to Tier-3 production escalations? If customer success, sales, and executive teams work 5 days, engineers will return Monday morning to an overwhelming backlog of unresolved customer tickets, instantly negating the restorative benefits of the extra day off. Staggered rotations break sprint alignment and team collaboration rituals.',
        keyPoints: [
          'Friday operational blindspot for critical enterprise customer escalations',
          'Cross-department misalignment with 5-day sales, marketing, and CS teams',
          'Staggered shifts introduce coordination overhead and fragmented standups'
        ],
        timestamp: 'Round 1 · Turn 3',
      },
      {
        id: 'r1-mod-sum-4d',
        round: 1,
        agentRole: 'moderator',
        agentName: 'Moderator',
        kind: 'round_summary',
        title: 'Round 1 Synthesis',
        content: 'Pro has demonstrated substantial retention and focus gains, while Con has identified a tangible operational vulnerability: Friday coverage for 24/7 SaaS clients. Round 2 must examine concrete scheduling models.',
        timestamp: 'Round 1 · Summary',
      },
      {
        id: 'r2-mod-q-4d',
        round: 2,
        agentRole: 'moderator',
        agentName: 'Moderator',
        kind: 'moderator_question',
        title: 'Round 2 Inquiry: On-Call Rotation Architecture',
        content: 'How can the organization guarantee uninterrupted 24/7 SLA response and smooth customer support collaboration without forcing on-call engineers to sacrifice their rest days? Present your operational models.',
        targetedAgent: 'both',
        timestamp: 'Round 2 · Turn 1',
      },
      {
        id: 'r2-pro-4d-2',
        round: 2,
        agentRole: 'pro',
        agentName: 'Pro Agent',
        kind: 'argument',
        title: 'Dedicated Compensated Friday Rotations and Async Escalations',
        content: 'We solve Friday coverage through a rotating "Designated Friday Champion" system. Two engineers handle emergency Tier-3 escalations on Friday, receiving a Monday recovery day and an additional on-call stipend. Across 35 engineers, an individual engineer only serves this rotation once every 4 months. Pair this with our automated PagerDuty alert triage, and enterprise SLAs remain 100% protected while 94% of the department enjoys an uninterrupted 4-day cadence.',
        keyPoints: [
          'Rotating Friday Champion model protects 99.9% uptime SLA',
          'Engineers rotated once every 17 weeks with compensatory time off and stipend',
          'Documented async escalation protocol prevents ticket backlog accumulation'
        ],
        timestamp: 'Round 2 · Turn 2',
      },
      {
        id: 'r2-con-4d-2',
        round: 2,
        agentRole: 'con',
        agentName: 'Con Agent',
        kind: 'argument',
        title: 'Risk of Condensed Workday Stress and Deadline Compaction',
        content: 'Even with rotation schedules, compressing weekly deliverables into 32 hours can inadvertently increase daily stress. If project deadlines do not adjust proportionally, engineers simply work 10-hour days Monday through Thursday, increasing acute burnout. The company must implement a 90-day reversible pilot with clear velocity and happiness checkpoints before making any contractual policy changes.',
        keyPoints: [
          'Potential for 10-hour compressed days causing acute weekday exhaustion',
          'Scope of quarterly commitments must explicitly downscale by 15-20% initially',
          'Mandatory 90-day pilot required before permanent employment contract updates'
        ],
        timestamp: 'Round 2 · Turn 3',
      },
      {
        id: 'r2-mod-sum-4d',
        round: 2,
        agentRole: 'moderator',
        agentName: 'Moderator',
        kind: 'round_summary',
        title: 'Final Debate Synthesis for Judge',
        content: 'Both agents have converged on practical execution realities: Pro provided a workable on-call coverage model, and Con emphasized the necessity of a reversible pilot and quarterly scope calibration. Passing to Judge for decision.',
        timestamp: 'Round 2 · Final Summary',
      },
    ],
    verdict: {
      verdict: 'Yes',
      confidence: 81,
      summary: 'Approve adoption of a 32-hour 4-day work week for engineering, structured as a 6-month trial with rotating compensated Friday on-call coverage.',
      decidingFactors: [
        'Developer retention and reduced burnout directly improve system reliability and defect rates',
        'The 35-person headcount is sufficiently large to absorb rotating Friday coverage easily',
        'The proposed Friday Champion rotation maintains customer 99.9% SLA guarantees without burnout',
        'Competitive recruiting moat for top-tier senior software talent'
      ],
      risks: [
        'Friction with non-engineering teams (Sales, Marketing) who remain on 5-day schedules',
        'Risk of engineers over-compressing tasks into long, stressful 10-hour days',
        'Initial drop in velocity if meeting hygiene is not aggressively enforced'
      ],
      reasoning: 'The Pro agent effectively substantiated the cognitive productivity model: software engineering throughput is determined by deep uninterrupted focus rather than raw hours seated. The Con agent correctly pinpointed Friday SLA risks, but Pro’s rotating Friday Champion model completely mitigates this vulnerability for a 35-person team. Proceeding with a structured trial will safeguard talent and reduce defect frequency.',
      actionableRecommendations: [
        'Launch as a 6-month trial with bi-weekly developer sentiment and sprint velocity tracking.',
        'Implement the rotating Friday Champion system with 1.5x on-call stipend and Monday recovery day.',
        'Audit and eliminate recurring status meetings; transition cross-functional updates to asynchronous Slack/Loom digests.',
        'Calibrate Q1 deliverables to 85% of previous baseline capacity to avoid compressed workday stress.'
      ],
      voteBreakdown: {
        proStrength: 64,
        conStrength: 36
      }
    }
  }
];
