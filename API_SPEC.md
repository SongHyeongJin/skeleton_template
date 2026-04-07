# 가계부 서비스 API 명세

## 0. 프로젝트 파일 구조

```text
skeletonvue/
├─ public/
│  └─ favicon.ico
├─ src/
│  ├─ components/
│  │  ├─ DonutChart.vue
│  │  ├─ LayoutShell.vue
│  │  ├─ MonthlyBarChart.vue
│  │  ├─ SummaryCard.vue
│  │  └─ TransactionListItem.vue
│  ├─ pages/
│  │  ├─ BudgetManagePage.vue
│  │  ├─ CalendarPage.vue
│  │  ├─ HomeOverviewPage.vue
│  │  ├─ TransactionFormPage.vue
│  │  └─ TransactionsPage.vue
│  ├─ router/
│  │  └─ index.js
│  ├─ services/
│  │  └─ api.js
│  ├─ stores/
│  │  └─ transactions.js
│  ├─ styles/
│  │  └─ main.css
│  ├─ utils/
│  │  ├─ format.js
│  │  └─ summary.js
│  ├─ App.vue
│  └─ main.js
├─ API_SPEC.md
├─ db.json
├─ index.html
├─ jsconfig.json
├─ package-lock.json
├─ package.json
└─ vite.config.js
```

## 1. 기본 정보

- Base URL: `http://localhost:3000`
- Backend: `json-server`
- 실행 명령:

```bash
npm run server
```

또는:

```bash
npx json-server db.json
```

## 2. 공통 규칙

- 요청/응답 형식: `application/json`
- 날짜 형식:
  - 거래 날짜: `YYYY-MM-DD`
  - 예산 월: `YYYY-MM`
  - 생성/수정 시각: ISO 문자열
- 금액:
  - 숫자 타입
  - 0보다 큰 값 사용
- 거래 유형:
  - `income`: 수입
  - `expense`: 지출

## 3. 데이터 모델

### 3.1 Transaction

```json
{
  "id": "1",
  "date": "2026-04-07",
  "type": "income",
  "category": "월급",
  "amount": 3000000,
  "memo": "4월 월급",
  "createdAt": "2026-04-07T09:00:00.000Z",
  "updatedAt": "2026-04-07T09:00:00.000Z"
}
```

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `id` | string | 예 | 거래 ID |
| `date` | string | 예 | 거래 날짜, `YYYY-MM-DD` |
| `type` | string | 예 | `income` 또는 `expense` |
| `category` | string | 예 | 거래 카테고리 |
| `amount` | number | 예 | 거래 금액 |
| `memo` | string | 아니오 | 메모 |
| `createdAt` | string | 예 | 생성 시각 |
| `updatedAt` | string | 예 | 수정 시각 |

### 3.2 Category

```json
{
  "id": "expense-food",
  "name": "식비",
  "type": "expense"
}
```

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `id` | string | 예 | 카테고리 ID |
| `name` | string | 예 | 카테고리 이름 |
| `type` | string | 예 | `income` 또는 `expense` |

### 3.3 Budget

```json
{
  "id": "2026-04",
  "month": "2026-04",
  "amount": 1000000,
  "categoryBudgets": {
    "식비": 300000,
    "교통비": 120000,
    "쇼핑": 250000
  },
  "createdAt": "2026-04-01T00:00:00.000Z",
  "updatedAt": "2026-04-01T00:00:00.000Z"
}
```

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `id` | string | 예 | 예산 ID. 월과 동일하게 사용 |
| `month` | string | 예 | 예산 월, `YYYY-MM` |
| `amount` | number | 예 | 전체 예산. 카테고리별 예산 합계 |
| `categoryBudgets` | object | 예 | 카테고리별 예산 |
| `createdAt` | string | 예 | 생성 시각 |
| `updatedAt` | string | 예 | 수정 시각 |

## 4. 거래 API

### 4.1 거래 목록 조회

```http
GET /transactions
```

프론트 사용 예:

```http
GET /transactions?_sort=-date,-id
```

응답 예:

```json
[
  {
    "id": "1",
    "date": "2026-04-07",
    "type": "income",
    "category": "월급",
    "amount": 3000000,
    "memo": "4월 월급",
    "createdAt": "2026-04-07T09:00:00.000Z",
    "updatedAt": "2026-04-07T09:00:00.000Z"
  }
]
```

### 4.2 거래 단건 조회

```http
GET /transactions/{id}
```

예:

```http
GET /transactions/1
```

응답 예:

```json
{
  "id": "1",
  "date": "2026-04-07",
  "type": "income",
  "category": "월급",
  "amount": 3000000,
  "memo": "4월 월급",
  "createdAt": "2026-04-07T09:00:00.000Z",
  "updatedAt": "2026-04-07T09:00:00.000Z"
}
```

### 4.3 거래 등록

```http
POST /transactions
```

요청 예:

```json
{
  "date": "2026-04-08",
  "type": "expense",
  "category": "식비",
  "amount": 12000,
  "memo": "저녁 식사",
  "createdAt": "2026-04-08T10:00:00.000Z",
  "updatedAt": "2026-04-08T10:00:00.000Z"
}
```

응답 예:

```json
{
  "id": "abc1",
  "date": "2026-04-08",
  "type": "expense",
  "category": "식비",
  "amount": 12000,
  "memo": "저녁 식사",
  "createdAt": "2026-04-08T10:00:00.000Z",
  "updatedAt": "2026-04-08T10:00:00.000Z"
}
```

입력 검증:

- `date`: 유효한 날짜
- `type`: `income` 또는 `expense`
- `category`: 빈 값 불가
- `amount`: 숫자, 0보다 큰 값
- `memo`: 선택

### 4.4 거래 수정

```http
PATCH /transactions/{id}
```

예:

```http
PATCH /transactions/1
```

요청 예:

```json
{
  "amount": 15000,
  "memo": "저녁 식사 수정",
  "updatedAt": "2026-04-08T11:00:00.000Z"
}
```

응답 예:

```json
{
  "id": "1",
  "date": "2026-04-07",
  "type": "income",
  "category": "월급",
  "amount": 15000,
  "memo": "저녁 식사 수정",
  "createdAt": "2026-04-07T09:00:00.000Z",
  "updatedAt": "2026-04-08T11:00:00.000Z"
}
```

### 4.5 거래 삭제

```http
DELETE /transactions/{id}
```

예:

```http
DELETE /transactions/1
```

성공 시 응답:

```json
{}
```

## 5. 카테고리 API

### 5.1 카테고리 목록 조회

```http
GET /categories
```

응답 예:

```json
[
  {
    "id": "income-salary",
    "name": "월급",
    "type": "income"
  },
  {
    "id": "expense-food",
    "name": "식비",
    "type": "expense"
  }
]
```

### 5.2 수입 카테고리 조회

```http
GET /categories?type=income
```

### 5.3 지출 카테고리 조회

```http
GET /categories?type=expense
```

## 6. 예산 API

### 6.1 예산 목록 조회

```http
GET /budgets
```

응답 예:

```json
[
  {
    "id": "2026-04",
    "month": "2026-04",
    "amount": 1000000,
    "categoryBudgets": {
      "식비": 300000,
      "교통비": 120000,
      "쇼핑": 250000,
      "문화생활": 150000,
      "공과금": 180000
    },
    "createdAt": "2026-04-01T00:00:00.000Z",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  }
]
```

### 6.2 특정 월 예산 조회

```http
GET /budgets?month={YYYY-MM}
```

예:

```http
GET /budgets?month=2026-04
```

응답 예:

```json
[
  {
    "id": "2026-04",
    "month": "2026-04",
    "amount": 1000000,
    "categoryBudgets": {
      "식비": 300000,
      "교통비": 120000
    },
    "createdAt": "2026-04-01T00:00:00.000Z",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  }
]
```

### 6.3 월별 예산 생성

```http
POST /budgets
```

요청 예:

```json
{
  "id": "2026-05",
  "month": "2026-05",
  "amount": 420000,
  "categoryBudgets": {
    "식비": 300000,
    "교통비": 120000
  },
  "createdAt": "2026-05-01T00:00:00.000Z",
  "updatedAt": "2026-05-01T00:00:00.000Z"
}
```

응답 예:

```json
{
  "id": "2026-05",
  "month": "2026-05",
  "amount": 420000,
  "categoryBudgets": {
    "식비": 300000,
    "교통비": 120000
  },
  "createdAt": "2026-05-01T00:00:00.000Z",
  "updatedAt": "2026-05-01T00:00:00.000Z"
}
```

현재 프론트 구현 규칙:

- 전체 예산 `amount`는 직접 입력하지 않음
- `amount`는 `categoryBudgets`의 금액 합계로 자동 계산
- 이미 설정된 카테고리는 예산 추가 선택 목록에서 제외

### 6.4 월별 예산 수정

```http
PATCH /budgets/{id}
```

예:

```http
PATCH /budgets/2026-04
```

요청 예:

```json
{
  "month": "2026-04",
  "amount": 570000,
  "categoryBudgets": {
    "식비": 300000,
    "교통비": 120000,
    "쇼핑": 150000
  },
  "updatedAt": "2026-04-08T12:00:00.000Z"
}
```

응답 예:

```json
{
  "id": "2026-04",
  "month": "2026-04",
  "amount": 570000,
  "categoryBudgets": {
    "식비": 300000,
    "교통비": 120000,
    "쇼핑": 150000
  },
  "createdAt": "2026-04-01T00:00:00.000Z",
  "updatedAt": "2026-04-08T12:00:00.000Z"
}
```

### 6.5 카테고리 예산 추가

json-server에는 카테고리 예산 전용 엔드포인트가 없으므로 월별 예산 객체의 `categoryBudgets`를 수정합니다.

```http
PATCH /budgets/{month}
```

요청 예:

```json
{
  "categoryBudgets": {
    "식비": 300000,
    "교통비": 120000,
    "쇼핑": 150000
  },
  "amount": 570000,
  "updatedAt": "2026-04-08T12:00:00.000Z"
}
```

### 6.6 카테고리 예산 수정

```http
PATCH /budgets/{month}
```

요청 예:

```json
{
  "categoryBudgets": {
    "식비": 350000,
    "교통비": 120000,
    "쇼핑": 150000
  },
  "amount": 620000,
  "updatedAt": "2026-04-08T12:10:00.000Z"
}
```

### 6.7 카테고리 예산 삭제

```http
PATCH /budgets/{month}
```

요청 예:

```json
{
  "categoryBudgets": {
    "식비": 350000,
    "쇼핑": 150000
  },
  "amount": 500000,
  "updatedAt": "2026-04-08T12:20:00.000Z"
}
```

위 예시는 `교통비` 예산을 삭제한 상태입니다.

## 7. 예산 경고 규칙

예산 소진율 계산:

```text
소진율 = 현재 지출 / 설정 예산 * 100
```

경고 기준:

| 조건 | 상태 | 메시지 |
| --- | --- | --- |
| 예산 미설정 | 미설정 | 예산을 설정해 주세요. |
| 80% 이상 90% 미만 | 주의 | 예산의 80% 이상을 사용했습니다. |
| 90% 이상 100% 이하 | 경고 | 예산의 90% 이상을 사용했습니다. |
| 100% 초과 | 초과 | 예산을 초과했습니다. |

거래 등록 시:

- 지출 거래인 경우 전체 예산 상태를 확인
- 해당 카테고리 예산이 설정되어 있으면 카테고리 예산 상태도 확인
- 경고 조건에 해당하면 알림 표시

## 8. 프론트엔드 사용 파일

| 역할 | 파일 |
| --- | --- |
| API 호출 | `src/services/api.js` |
| 전역 상태 관리 | `src/stores/transactions.js` |
| 홈 화면 | `src/pages/HomeOverviewPage.vue` |
| 거래 목록 | `src/pages/TransactionsPage.vue` |
| 거래 등록/수정 | `src/pages/TransactionFormPage.vue` |
| 예산 관리 | `src/pages/BudgetManagePage.vue` |
| 달력 | `src/pages/CalendarPage.vue` |
| 라우터 | `src/router/index.js` |
