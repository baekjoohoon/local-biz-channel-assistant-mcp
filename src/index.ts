import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import * as z from "zod/v4";
import {
  buildShopDiagnosis,
  createCampaign,
  draftReplies,
  reviewMenuBoard,
  weeklyPlan
} from "./domain.js";

const SERVICE_NAME = "Dongne Biz Assistant(동네 장사 비서)";

const readOnlyAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: false,
  idempotentHint: true
};

const BusinessProfileSchema = {
  businessName: z.string().min(1).describe("상호명"),
  businessType: z.string().min(1).describe("업종. 예: 카페, 미용실, 분식집, 필라테스"),
  neighborhood: z.string().min(1).describe("동네/상권명. 예: 성수동, 판교역 근처"),
  targetCustomers: z.array(z.string()).min(1).max(5).describe("주요 고객군"),
  signatureItems: z.array(z.string()).max(8).optional().describe("대표 상품/서비스"),
  priceRange: z.string().optional().describe("가격대 또는 객단가"),
  brandTone: z.enum(["friendly", "premium", "practical", "playful", "calm"]).optional().describe("브랜드 말투")
};

function createServer() {
  const server = new McpServer(
    {
      name: "dongne-biz-channel-assistant",
      version: "1.0.0"
    },
    {
      capabilities: {
        logging: {}
      }
    }
  );

  server.registerTool(
    "diagnose_local_shop",
    {
      title: "동네 매장 진단",
      description:
        `${SERVICE_NAME} analyzes a local shop profile, customer segments, and current challenge, then suggests practical next actions for channel-based customer communication.`,
      annotations: {
        title: "Diagnose local shop",
        ...readOnlyAnnotations
      },
      inputSchema: {
        profile: z.object(BusinessProfileSchema).describe("매장 기본 정보"),
        currentChallenge: z.string().min(1).describe("현재 고민. 예: 점심 이후 손님이 적음, 신메뉴 홍보, 리뷰 부족")
      }
    },
    async ({ profile, currentChallenge }) => {
      const structuredContent = buildShopDiagnosis(profile, currentChallenge);
      return asResult(structuredContent);
    }
  );

  server.registerTool(
    "create_channel_campaign",
    {
      title: "카카오톡 채널 캠페인 생성",
      description:
        `${SERVICE_NAME} creates a short channel campaign message, offer structure, posting plan, KPIs, and compliance guardrails for a local small business.`,
      annotations: {
        title: "Create channel campaign",
        ...readOnlyAnnotations
      },
      inputSchema: {
        profile: z.object(BusinessProfileSchema).describe("매장 기본 정보"),
        goal: z
          .enum(["new_customers", "repeat_visits", "quiet_hours", "new_menu", "reservation_fill", "review_growth"])
          .describe("캠페인 목표"),
        durationDays: z.number().int().min(1).max(30).describe("캠페인 기간"),
        budgetLevel: z.enum(["none", "low", "medium"]).describe("혜택 예산 수준"),
        seasonOrEvent: z.string().optional().describe("계절/지역행사/기념일 맥락")
      }
    },
    async ({ profile, goal, durationDays, budgetLevel, seasonOrEvent }) => {
      const structuredContent = createCampaign(profile, goal, durationDays, budgetLevel, seasonOrEvent);
      return asResult(structuredContent);
    }
  );

  server.registerTool(
    "draft_customer_reply",
    {
      title: "고객 답장 초안",
      description:
        `${SERVICE_NAME} drafts customer reply options for reservation, complaint, price question, sold out, delay, review thanks, and general channel inquiries.`,
      annotations: {
        title: "Draft customer reply",
        ...readOnlyAnnotations
      },
      inputSchema: {
        scenario: z
          .enum(["reservation", "complaint", "price_question", "sold_out", "late_delivery", "review_thanks", "general"])
          .describe("응대 상황"),
        customerMessage: z.string().describe("고객이 보낸 메시지"),
        tone: z.enum(["friendly", "premium", "practical", "playful", "calm"]).optional().describe("응대 톤"),
        policy: z.string().optional().describe("매장 환불/예약/보상 등 안내 기준")
      }
    },
    async ({ scenario, customerMessage, tone, policy }) => {
      const structuredContent = draftReplies(scenario, customerMessage, tone, policy);
      return asResult(structuredContent);
    }
  );

  server.registerTool(
    "review_menu_for_channel",
    {
      title: "채널용 메뉴 구성 점검",
      description:
        `${SERVICE_NAME} reviews menu or service items and recommends hero items, bundle ideas, upsell candidates, and simple menu-board fixes for channel messages.`,
      annotations: {
        title: "Review menu for channel",
        ...readOnlyAnnotations
      },
      inputSchema: {
        items: z
          .array(
            z.object({
              name: z.string().min(1).describe("메뉴/서비스명"),
              price: z.number().nonnegative().describe("가격"),
              category: z.string().optional().describe("분류"),
              isSignature: z.boolean().optional().describe("대표 메뉴 여부"),
              marginHint: z.enum(["low", "medium", "high"]).optional().describe("마진 힌트")
            })
          )
          .min(1)
          .max(30)
          .describe("메뉴/서비스 목록")
      }
    },
    async ({ items }) => {
      const structuredContent = reviewMenuBoard(items);
      return asResult(structuredContent);
    }
  );

  server.registerTool(
    "build_weekly_growth_plan",
    {
      title: "7일 성장 실행계획",
      description:
        `${SERVICE_NAME} builds a 7-day execution plan for a local business owner with daily channel actions, outputs, and simple measurement points.`,
      annotations: {
        title: "Build weekly growth plan",
        ...readOnlyAnnotations
      },
      inputSchema: {
        profile: z.object(BusinessProfileSchema).describe("매장 기본 정보"),
        weeklyGoal: z.string().min(1).describe("이번 주 목표"),
        availableHours: z.number().min(1).max(20).describe("이번 주 채널 운영에 쓸 수 있는 시간")
      }
    },
    async ({ profile, weeklyGoal, availableHours }) => {
      const structuredContent = weeklyPlan(profile, weeklyGoal, availableHours);
      return asResult(structuredContent);
    }
  );

  server.registerResource(
    "submission-summary",
    "mcp://dongne-biz-channel-assistant/submission-summary",
    {
      title: "공모전 제출 요약",
      description: "AGENTIC PLAYER 10 제출용 서비스 소개 요약",
      mimeType: "text/markdown"
    },
    async uri => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: [
            "# 동네 장사 카톡 비서",
            "",
            "소상공인이 카카오톡 채널에서 바로 사용할 수 있는 캠페인, 고객 응대, 메뉴 구성, 주간 실행계획을 생성하는 Remote MCP 서버입니다.",
            "",
            "핵심 가치는 복잡한 마케팅 지식을 카카오톡 대화 안에서 실행 가능한 문구와 체크리스트로 바꾸는 것입니다."
          ].join("\n")
        }
      ]
    })
  );

  return server;
}

function asResult(structuredContent: Record<string, unknown>) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(structuredContent, null, 2)
      }
    ],
    structuredContent
  };
}

const app = createMcpExpressApp();
const port = Number(process.env.PORT ?? 3000);

app.get("/", (_req, res) => {
  res.json({
    name: "dongne-biz-channel-assistant",
    status: "ok",
    mcpEndpoint: "/mcp"
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/mcp", async (req, res) => {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on("close", () => {
      void transport.close();
      void server.close();
    });
  } catch (error) {
    console.error("MCP request failed", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error"
        },
        id: null
      });
    }
  }
});

app.get("/mcp", (_req, res) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed. Use POST for stateless Streamable HTTP MCP requests."
    },
    id: null
  });
});

app.delete("/mcp", (_req, res) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed for stateless MCP server."
    },
    id: null
  });
});

app.listen(port, error => {
  if (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
  console.log(`Dongne Biz Channel Assistant MCP listening on ${port}`);
});
