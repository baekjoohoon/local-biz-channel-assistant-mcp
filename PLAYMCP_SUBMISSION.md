# PlayMCP 등록/심사 요청 자료

## PlayMCP in KC

Git URL:

```text
https://github.com/baekjoohoon/local-biz-channel-assistant-mcp.git
```

Branch/ref:

```text
main
```

Dockerfile:

```text
Dockerfile
```

KC 서버 이름:

```text
dongne-biz-channel-assistant
```

KC 설명:

```text
소상공인이 채널 메시지, 고객 응대, 메뉴 구성, 주간 실행계획을 바로 만들 수 있게 돕는 동네 장사 비서 MCP 서버입니다.
```

Endpoint:

```text
https://dongne-biz-channel-assistant.playmcp-endpoint.kakaocloud.io/mcp
```

## PlayMCP 등록값

대표 이미지:

```text
assets/representative-image.png
```

MCP 이름:

```text
동네 장사 비서
```

MCP 식별자:

```text
dongneBiz
```

MCP 설명:

```text
동네 장사 비서는 소상공인이 고객과 만나는 채널에서 바로 실행할 수 있는 마케팅과 응대 작업을 돕는 MCP 서비스입니다. 매장 정보와 현재 고민을 입력하면 캠페인 메시지, 고객 답장 초안, 메뉴 구성 개선안, 7일 실행계획을 생성합니다. 복잡한 마케팅 지식 없이도 사장님이 바로 복사해 쓰고 실행할 수 있는 결과물을 제공하는 것이 핵심입니다.
```

대화 예시:

```text
우리 카페 한산한 시간 매출 올려줘
```

```text
고객 불만 답장 문구 만들어줘
```

```text
이번 주 채널 운영계획 짜줘
```

인증 방식:

```text
인증 사용하지 않음
```

## 임시 등록 후 테스트 문장

캠페인 생성:

```text
우리 카페가 오후 2시부터 5시까지 손님이 적어. 판교역 근처 직장인이 많이 오고 대표 메뉴는 바닐라빈 라떼랑 소금빵이야. 한산한 시간 매출 올릴 캠페인 만들어줘.
```

고객 응대:

```text
고객이 "배달이 너무 늦었고 음식이 식었어요"라고 했어. 정중한 답장 3개 만들어줘.
```

메뉴 점검:

```text
우리 분식집 메뉴는 김밥 4000원, 떡볶이 5000원, 튀김 4500원, 라면 4500원이야. 채널에 올릴 대표 메뉴 구성 점검해줘.
```

주간 계획:

```text
서현역 분식집인데 직장인과 학생이 많이 와. 대표 메뉴는 떡볶이와 김밥이고 이번 주 목표는 점심 이후 방문 늘리기야. 4시간 안에서 운영계획 짜줘.
```

## 심사 요청 전 체크

- PlayMCP in KC 서버가 최신 GitHub commit으로 재배포되어 있어야 함
- KC 상세 화면에서 Tools 5개가 보여야 함
- PlayMCP 개발자 콘솔에서 정보 불러오기가 성공해야 함
- 임시 등록 후 도구함에 추가해야 함
- AI 채팅에서 최소 캠페인/고객응대/메뉴점검 3개 테스트가 성공해야 함
- 테스트 답변이 실제 사용 가능한 한국어 결과로 보여야 함
- 문제 없으면 임시 등록 상태의 MCP에서 심사 요청
- 심사 승인 후 공개 상태를 전체 공개로 변경
- 전체 공개된 MCP 상세 페이지 URL을 공모전 예선 참여 양식에 제출
