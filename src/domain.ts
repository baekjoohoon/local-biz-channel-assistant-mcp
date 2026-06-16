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
  const companionItem = shop.signatureItems[1] ?? "추천 메뉴";
  const eventText = seasonOrEvent ? `${seasonOrEvent}에 맞춰 ` : "";
  const benefit = buildOffer(shop, goal, budgetLevel);
  const quietHour = goal === "quiet_hours" ? "오후 2시부터 5시까지" : "운영 시간 중";

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
    `${eventText}${heroItem}${shop.signatureItems.length > 1 ? `와 ${companionItem}` : ""}을 가장 편하게 즐길 수 있는 구성을 준비했습니다.`,
    goal === "quiet_hours" ? `이용 시간: ${quietHour}` : undefined,
    `혜택: ${benefit.primary}`,
    `기간: 오늘부터 ${durationDays}일간`,
    "원하시면 이 메시지에 답장으로 문의해주세요."
  ].filter(Boolean).join("\n");

  return {
    goal: goalLabels[goal],
    campaignName: `${shop.businessName} ${goalLabels[goal]} ${durationDays}일 캠페인`,
    target: shop.targetCustomers.slice(0, 3),
    recommendedOffer: benefit,
    channelMessage: message,
    messageVariants: [
      message,
      `[${shop.businessName}] ${quietHour} 잠깐 쉬어가세요\n${heroItem}${shop.signatureItems.length > 1 ? ` + ${companionItem}` : ""} 추천 구성을 ${durationDays}일간 준비했습니다.\n방문 전 답장 주시면 바로 안내드릴게요.`,
      `[${shop.businessName}] 오늘의 조용한 시간 추천\n${shop.neighborhood}에서 일하다가 잠깐 쉬고 싶을 때 ${heroItem}을 추천드려요.\n${benefit.primary}`
    ],
    postingPlan: [
      "1일차 오전 10시: 핵심 혜택과 이용 시간 공지",
      goal === "quiet_hours" ? "1일차 오후 1시 40분: 한산한 시간 직전 짧은 리마인드" : "2일차 오후: 대표 상품 사진과 짧은 후기형 문구",
      "3일차 오후: 실제 주문하기 쉬운 추천 조합 재안내",
      durationDays >= 5 ? "마감 2일 전 오후: 남은 기간 리마인드" : "마감 전날 오후: 짧은 리마인드",
      "마감일 오전: 오늘까지 안내"
    ],
    actionChecklist: [
      "카운터 또는 메뉴판 옆에 같은 문구를 작게 붙인다",
      "직원이 주문 받을 때 혜택명을 한 번만 말한다",
      "방문 고객이 어떤 문구를 보고 왔는지 간단히 기록한다"
    ],
    kpis: ["채널 메시지 클릭/답장 수", "혜택명 언급 방문 수", "캠페인 시간대 객수", "추천 조합 판매 수"],
    guardrails: [
      "혜택 조건, 기간, 제외 항목을 한 문장으로 명시",
      "과장된 효능 표현 금지",
      "개인정보는 채널 답장으로 과도하게 요구하지 않기"
    ]
  };
}

function buildOffer(shop: Required<BusinessProfile>, goal: CampaignGoal, budgetLevel: "none" | "low" | "medium") {
  const heroItem = shop.signatureItems[0] ?? "대표 상품";
  const companionItem = shop.signatureItems[1] ?? "추천 메뉴";
  const pair = shop.signatureItems.length > 1 ? `${heroItem} + ${companionItem}` : heroItem;

  if (goal === "quiet_hours") {
    if (budgetLevel === "none") {
      return {
        primary: `오후 2시부터 5시까지 ${pair}를 오늘의 추천 조합으로 우선 안내`,
        fallback: "할인 없이도 선택 이유를 명확히 보여주는 추천형 캠페인",
        condition: "매장 상황에 따라 조합명과 시간대를 명확히 고지"
      };
    }
    if (budgetLevel === "low") {
      return {
        primary: `오후 2시부터 5시까지 ${pair} 주문 시 1,000원 상당 추가 혜택`,
        fallback: "스탬프 1개 추가 또는 작은 사이드 제공",
        condition: "1인 1회, 재고 소진 시 종료"
      };
    }
    return {
      primary: `오후 2시부터 5시까지 ${pair} 한정 세트 구성`,
      fallback: "세트 가격 또는 사이드 업그레이드 중 매장 부담이 낮은 방식 선택",
      condition: "기간, 시간대, 제외 메뉴를 함께 고지"
    };
  }

  if (budgetLevel === "none") {
    return {
      primary: `${heroItem}을 처음 고르는 고객을 위한 추천 이유 안내`,
      fallback: "혜택 대신 선택 가이드를 제공",
      condition: "가격 할인 표현 없이 추천 기준을 명확히 안내"
    };
  }

  if (budgetLevel === "low") {
    return {
      primary: `${heroItem} 주문 고객에게 소액 쿠폰 또는 다음 방문 혜택 제공`,
      fallback: "스탬프 추가 적립",
      condition: "혜택 기간과 사용 조건을 한 문장으로 안내"
    };
  }

  return {
    primary: `${pair} 기간 한정 세트 혜택`,
    fallback: "대표 상품 중심의 묶음 구성",
    condition: "혜택 구성과 제외 조건을 명확히 안내"
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

  const recoveryStepByScenario: Record<ReplyScenario, string> = {
    reservation: "가능한 시간대를 확인한 뒤 예약 확정 여부를 바로 안내합니다.",
    complaint: "주문/방문 내용을 확인하고, 불편 지점과 가능한 조치 범위를 분명히 안내합니다.",
    price_question: "가격, 포함 항목, 추가 비용 여부를 한 번에 정리합니다.",
    sold_out: "대체 가능한 메뉴와 재입고 예상 시간을 함께 안내합니다.",
    late_delivery: "현재 위치나 예상 도착 시간을 확인하고, 식은 음식/지연에 대한 조치 기준을 안내합니다.",
    review_thanks: "감사 인사와 함께 다음 방문 이유를 자연스럽게 제안합니다.",
    general: "고객이 바로 다음 행동을 할 수 있도록 선택지를 좁혀 안내합니다."
  };

  const replyClosers: Record<ReplyScenario, string> = {
    reservation: "원하시는 시간과 인원을 알려주시면 바로 확인하겠습니다.",
    complaint: "불편하셨던 부분을 매장에서 확인한 뒤 가능한 조치를 안내드리겠습니다.",
    price_question: "원하시는 구성이나 인원 수를 알려주시면 더 정확히 안내드리겠습니다.",
    sold_out: "가능한 대체 메뉴를 원하시면 바로 추천드리겠습니다.",
    late_delivery: "확인되는 대로 예상 시간과 조치 방법을 바로 말씀드리겠습니다.",
    review_thanks: "다음 방문 때도 만족하실 수 있게 더 잘 준비하겠습니다.",
    general: "필요하신 내용을 한 번 더 알려주시면 바로 도와드리겠습니다."
  };

  return {
    interpretedCustomerNeed: base,
    tone: toneText,
    responsePrinciple: `${toneText} 톤으로 사과 또는 감사 인사를 먼저 전하고, 확인할 내용과 다음 행동을 분리해서 말합니다.`,
    replies: [
      `${scenarioOpeners[scenario]} 말씀 주신 내용 먼저 확인하겠습니다. ${replyClosers[scenario]}${policyLine}`,
      `${scenarioOpeners[scenario]} 기다리시지 않도록 지금 가능한 방법부터 정리해드릴게요. ${replyClosers[scenario]}${policyLine}`,
      `${scenarioOpeners[scenario]} 말씀 주신 부분은 매장에서 바로 확인하겠습니다. ${recoveryStepByScenario[scenario]}${policyLine}`
    ],
    internalChecklist: [
      "고객 감정에 먼저 반응한다",
      "주문번호, 방문 시간, 예약 시간 등 최소 정보만 요청한다",
      "확인 후 다시 연락할 시간을 정한다",
      "환불/보상은 매장 정책 범위 안에서만 확정 표현을 쓴다"
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
  const affordable = [...items].sort((a, b) => a.price - b.price)[0];
  const premium = [...items].sort((a, b) => b.price - a.price)[0];
  const hero = anchors[0];

  return {
    heroItems: anchors.map(item => item.name),
    bundleIdeas: anchors.map((item, index) => ({
      name: `${item.name} ${index + 1}인 추천 세트`,
      logic: "대표 상품을 기준으로 선택 피로를 줄이고 객단가를 올리는 구성",
      suggestedPriceHint: `${Math.round(item.price * 1.15 / 100) * 100}원 안팎부터 테스트`,
      suggestedCopy: `${item.name}을 처음 드신다면 이 조합부터 추천드려요.`
    })),
    entryItem: affordable ? `${affordable.name}을 입문 메뉴로 앞세워 첫 주문 장벽을 낮춥니다.` : undefined,
    premiumAnchor: premium ? `${premium.name}은 상단에 두되, 가격보다 선택 이유를 먼저 보여줍니다.` : undefined,
    upsellCandidates: (highMargin.length ? highMargin : anchors.slice(0, 2)).map(item => ({
      item: item.name,
      message: `${item.name} 추가 시 만족도가 올라가는 선택지로 안내`
    })),
    channelPostDraft: hero
      ? `[오늘의 추천] ${hero.name}\n처음 오셨다면 이 메뉴부터 추천드려요.\n메뉴를 고르기 어렵다면 답장으로 취향을 알려주세요.`
      : "대표 메뉴 1개를 정한 뒤 짧은 추천 문구를 붙여 채널에 올리세요.",
    menuBoardFixes: [
      "대표 메뉴는 상단 3개 안에 배치",
      "가격보다 선택 이유를 먼저 보여주기",
      "채널 메시지에는 메뉴를 3개 이하로 제한",
      "세트명은 메뉴명보다 상황 중심으로 짓기. 예: 점심 빠른 한 끼, 퇴근길 간식"
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
    operatingPrinciple: "하루에 하나의 행동만 만들고, 채널 메시지는 짧게 보내며, 성과는 답장/방문/판매 중 하나로 기록한다.",
    days: [
      { day: "월", time: "30분", action: `${focus} 구매 이유 3개 정리`, output: "채널 메시지 초안 1개" },
      { day: "화", time: "40분", action: "단골/신규 고객별 혜택 문구 분리", output: "고객군별 문구 2개" },
      { day: "수", time: "30분", action: "사진 또는 메뉴판에서 대표 컷 선정", output: "업로드 소재 1개" },
      { day: "목", time: "20분", action: "한산한 시간대 혜택 공지", output: "방문 유도 메시지" },
      { day: "금", time: "20분", action: "주말 예약/방문 리마인드", output: "마감성 메시지" },
      { day: "토", time: "30분", action: "고객 질문과 반응 기록", output: "자주 묻는 질문 3개" },
      { day: "일", time: "30분", action: "성과 확인 후 다음 주 반복 캠페인 선택", output: "다음 주 우선순위" }
    ],
    firstMessageDraft: `[${shop.businessName}] 이번 주 추천\n${focus}을 가장 편하게 즐길 수 있는 구성을 준비했습니다.\n궁금하시면 이 메시지에 답장해주세요.`,
    ownerDashboard: {
      mondaySetup: "이번 주 목표와 대표 상품 1개를 고정",
      dailyRecord: "답장 수, 방문 언급 수, 판매 수를 하루 1분 기록",
      sundayDecision: "반응이 있었던 문구만 남기고 다음 주에 반복"
    },
    measurement: ["답장 수", "방문 시 언급 수", "예약 전환 수", "재방문 쿠폰 사용 수"]
  };
}
