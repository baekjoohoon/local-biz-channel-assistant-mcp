export type BusinessProfile = {
  businessName: string;
  businessType: string;
  neighborhood: string;
  targetCustomers: string[];
  signatureItems?: string[];
  priceRange?: string;
  brandTone?: "friendly" | "premium" | "practical" | "playful" | "calm";
};

export type CampaignGoal =
  | "new_customers"
  | "repeat_visits"
  | "quiet_hours"
  | "new_menu"
  | "reservation_fill"
  | "review_growth";

export type ReplyScenario =
  | "reservation"
  | "complaint"
  | "price_question"
  | "sold_out"
  | "late_delivery"
  | "review_thanks"
  | "general";

const goalLabels: Record<CampaignGoal, string> = {
  new_customers: "신규 고객 유입",
  repeat_visits: "재방문 유도",
  quiet_hours: "한산한 시간대 매출 보강",
  new_menu: "신메뉴 알림",
  reservation_fill: "예약 공백 채우기",
  review_growth: "리뷰 증가"
};

const toneLabels = {
  friendly: "친근하고 따뜻한",
  premium: "정돈되고 고급스러운",
  practical: "명확하고 실용적인",
  playful: "가볍고 재치 있는",
  calm: "차분하고 신뢰감 있는"
} as const;

export function normalizeProfile(profile: BusinessProfile): Required<BusinessProfile> {
  return {
    ...profile,
    signatureItems: profile.signatureItems?.filter(Boolean) ?? [],
    priceRange: profile.priceRange || "중간 가격대",
    brandTone: profile.brandTone ?? "friendly"
  };
}

export function buildShopDiagnosis(profile: BusinessProfile, currentChallenge: string) {
  const shop = normalizeProfile(profile);
  const primarySegment = shop.targetCustomers[0] ?? "동네 고객";
  const heroItem = shop.signatureItems[0] ?? "대표 상품";

  return {
    positioning: `${shop.neighborhood}의 ${primarySegment}에게 ${heroItem}을 중심으로 기억되는 ${shop.businessType}`,
    likelyStrengths: [
      `${shop.neighborhood} 기반의 접근성`,
      `${shop.signatureItems.length > 0 ? shop.signatureItems.join(", ") : "대표 상품"} 중심의 메시지화 가능성`,
      `${toneLabels[shop.brandTone]} 톤으로 반복 방문을 만들 수 있음`
    ],
    riskSignals: [
      "가격 할인만 반복하면 브랜드 기억보다 할인 기대가 커질 수 있음",
      "채널 메시지가 길면 쿠폰, 예약, 방문 행동으로 이어지기 어려움",
      currentChallenge.includes("리뷰") ? "리뷰 요청은 보상 조건을 투명하게 안내해야 함" : "혜택 조건은 한 문장으로 닫혀야 함"
    ],
    nextBestActions: [
      "오늘 보낼 카카오톡 채널 메시지 1개를 짧게 만든다",
      "대표 상품 1개와 방문 이유 1개만 묶어 제안한다",
      "이번 주 성과 지표를 방문, 예약, 재방문 중 하나로 고정한다"
    ]
  };
}

export function createCampaign(profile: BusinessProfile, goal: CampaignGoal, durationDays: number, budgetLevel: "none" | "low" | "medium", seasonOrEvent?: string) {
  const shop = normalizeProfile(profile);
  const heroItem = shop.signatureItems[0] ?? "대표 상품";
  const eventText = seasonOrEvent ? `${seasonOrEvent}에 맞춰 ` : "";
  const benefit =
    budgetLevel === "none"
      ? "방문 고객에게 오늘의 추천 조합을 먼저 안내"
      : budgetLevel === "low"
        ? "소액 쿠폰 또는 사이드 혜택"
        : "기간 한정 세트 혜택";

  const headlineByGoal: Record<CampaignGoal, string> = {
    new_customers: `${shop.neighborhood}에서 처음 만나는 분께`,
    repeat_visits: `다시 들를 이유를 준비했어요`,
    quiet_hours: `한산한 시간에 더 여유롭게`,
    new_menu: `새로 준비한 ${heroItem}`,
    reservation_fill: `이번 주 남은 예약 시간 안내`,
    review_growth: `다녀가신 마음을 들려주세요`
  };

  const message = [
    `[${shop.businessName}] ${headlineByGoal[goal]}`,
    `${eventText}${heroItem}을 가장 맛있게 즐길 수 있는 구성을 준비했습니다.`,
    `혜택: ${benefit}`,
    `기간: 오늘부터 ${durationDays}일`,
    "원하시면 이 메시지에 답장으로 문의해주세요."
  ].join("\n");

  return {
    goal: goalLabels[goal],
    campaignName: `${shop.businessName} ${goalLabels[goal]} ${durationDays}일 캠페인`,
    target: shop.targetCustomers.slice(0, 3),
    offer: benefit,
    channelMessage: message,
    postingPlan: [
      "1일차 오전: 핵심 혜택 공지",
      "2일차 오후: 대표 상품 사진과 짧은 후기형 문구",
      durationDays >= 5 ? "마감 2일 전: 남은 기간 리마인드" : "마감 전날: 짧은 리마인드",
      "마감일 오후: 오늘까지 안내"
    ],
    kpis: ["채널 메시지 클릭/답장 수", "쿠폰 언급 방문 수", "예약 또는 문의 전환 수"],
    guardrails: [
      "혜택 조건, 기간, 제외 항목을 한 문장으로 명시",
      "과장된 효능 표현 금지",
      "개인정보는 채널 답장으로 과도하게 요구하지 않기"
    ]
  };
}

export function draftReplies(scenario: ReplyScenario, customerMessage: string, tone: BusinessProfile["brandTone"] = "friendly", policy?: string) {
  const toneText = toneLabels[tone ?? "friendly"];
  const policyLine = policy ? `\n안내 기준: ${policy}` : "";
  const base = customerMessage.trim() || "고객 문의";

  const scenarioOpeners: Record<ReplyScenario, string> = {
    reservation: "예약 문의 주셔서 감사합니다.",
    complaint: "불편을 드려 정말 죄송합니다.",
    price_question: "가격 문의 주셔서 감사합니다.",
    sold_out: "찾아주셨는데 품절로 불편을 드려 죄송합니다.",
    late_delivery: "기다리게 해드려 죄송합니다.",
    review_thanks: "소중한 후기 남겨주셔서 감사합니다.",
    general: "문의 주셔서 감사합니다."
  };

  return {
    interpretedCustomerNeed: base,
    tone: toneText,
    replies: [
      `${scenarioOpeners[scenario]} 확인 후 가장 빠르게 도와드리겠습니다.${policyLine}`,
      `${scenarioOpeners[scenario]} 지금 가능한 방법을 정리해서 안내드릴게요.${policyLine}`,
      `${scenarioOpeners[scenario]} 말씀 주신 부분은 매장에서 바로 확인하겠습니다.${policyLine}`
    ],
    followUpQuestions: [
      "방문 또는 수령 희망 시간이 있으실까요?",
      "성함 또는 주문 확인에 필요한 최소 정보만 알려주실 수 있을까요?"
    ],
    caution: "보상, 환불, 개인정보 요청은 매장 정책과 플랫폼 정책에 맞춰 명확하게 안내하세요."
  };
}

export function reviewMenuBoard(items: Array<{ name: string; price: number; category?: string; isSignature?: boolean; marginHint?: "low" | "medium" | "high" }>) {
  const sorted = [...items].sort((a, b) => Number(Boolean(b.isSignature)) - Number(Boolean(a.isSignature)) || b.price - a.price);
  const signatures = sorted.filter(item => item.isSignature).slice(0, 3);
  const highMargin = sorted.filter(item => item.marginHint === "high").slice(0, 3);
  const anchors = signatures.length ? signatures : sorted.slice(0, 3);

  return {
    heroItems: anchors.map(item => item.name),
    bundleIdeas: anchors.map((item, index) => ({
      name: `${item.name} ${index + 1}인 추천 세트`,
      logic: "대표 상품을 기준으로 선택 피로를 줄이고 객단가를 올리는 구성",
      suggestedCopy: `${item.name}을 처음 드신다면 이 조합부터 추천드려요.`
    })),
    upsellCandidates: highMargin.map(item => ({
      item: item.name,
      message: `${item.name} 추가 시 만족도가 올라가는 선택지로 안내`
    })),
    menuBoardFixes: [
      "대표 메뉴는 상단 3개 안에 배치",
      "가격보다 선택 이유를 먼저 보여주기",
      "카카오톡 채널 메시지에는 메뉴를 3개 이하로 제한"
    ]
  };
}

export function weeklyPlan(profile: BusinessProfile, weeklyGoal: string, availableHours: number) {
  const shop = normalizeProfile(profile);
  const focus = shop.signatureItems[0] ?? "대표 상품";
  const hours = Math.max(1, Math.min(20, availableHours));

  return {
    weeklyGoal,
    timeBudget: `${hours}시간`,
    operatingPrinciple: "하루에 하나의 행동만 만들고, 카카오톡 채널 메시지는 짧게 보낸다.",
    days: [
      { day: "월", action: `${focus} 구매 이유 3개 정리`, output: "채널 메시지 초안 1개" },
      { day: "화", action: "단골/신규 고객별 혜택 문구 분리", output: "고객군별 문구 2개" },
      { day: "수", action: "사진 또는 메뉴판에서 대표 컷 선정", output: "업로드 소재 1개" },
      { day: "목", action: "한산한 시간대 혜택 공지", output: "방문 유도 메시지" },
      { day: "금", action: "주말 예약/방문 리마인드", output: "마감성 메시지" },
      { day: "토", action: "고객 질문과 반응 기록", output: "자주 묻는 질문 3개" },
      { day: "일", action: "성과 확인 후 다음 주 반복 캠페인 선택", output: "다음 주 우선순위" }
    ],
    measurement: ["답장 수", "방문 시 언급 수", "예약 전환 수", "재방문 쿠폰 사용 수"]
  };
}
