// 아이들의 기록 — 자료 데이터
// 필드: id, author(가현/지용/영현/미상), year, ageAtTime, type, title, image, description, bodyText, public
// 연도·나이가 확인되지 않는 자료는 비워둡니다(추정하지 않음).

const FAMILY_ARCHIVE_DATA = [
  // ── ① 가현이의 어린 시절 시 ──
  {
    id: "gahyun-poem-isul-2006",
    author: "가현",
    year: 2006,
    ageAtTime: "",
    type: "poem",
    collection: "가현이의 어린 시절 시",
    title: "이슬",
    image: "web/gahyun-poem-isul-2006.jpeg",
    thumb: "thumbnails/gahyun-poem-isul-2006.jpeg",
    description: "이슬을 친구이자 가족으로 그려낸 시. 함박눈이 내릴 때, 햇볕이 내리쬘 때마다 이슬이 들려주는 이야기를 상상했다.",
    bodyText: `이슬

나는 이슬이 보슬보슬 맺히는 소풀 틈에서 잠에서 깨어납니다.

이슬은 나의 친구입니다.

함박눈이 내릴 때면 이슬은 나에게 눈썰매 이야기를 해주었고
햇볕이 내리쬘 때면 이슬은 나에게 낚시했던 이야기를 해 주었지요.

이슬은 나의 가족입니다.

내가 슬플 때면 같이 슬퍼해주고
내가 기쁠 때면 같이 기뻐했지요.

이슬은 내 마음의 모범생입니다.

아침에는 나를 보러오고 저녁에는 자신의 집으로 갔지요.

나는 커서 이슬이 사는 곳으로 찾아갈 것입니다.
이슬은 내 마음의 친구니까요.`,
    public: true,
  },
  {
    id: "gahyun-poem-jumeoni",
    author: "가현",
    year: "",
    ageAtTime: "",
    type: "poem",
    collection: "가현이의 어린 시절 시",
    title: "주머니와 집 같은 사랑",
    image: "web/gahyun-poem-jumeoni.jpeg",
    thumb: "thumbnails/gahyun-poem-jumeoni.jpeg",
    description: "집과 주머니라는 익숙한 사물을 부모님의 사랑에 빗댄 시.",
    bodyText: `주머니와 집 같은 사랑
박가현

집은 우리의 안식처다
우리는 힘들고 지친걸 집에서 풀 수 있다

주머니는 여러 물건의 안식처다
물건들은 주머니 속에만 있으면 안전하다

부모님은 우리를 주머니와 집처럼 감싸주고 보살펴주신다.

그렇기 때문에 우린 주머니와 집 같은 사랑에 보답하기 위해
'감사'라는 것을 부모님께 드려야 한다`,
    public: true,
  },
  {
    id: "gahyun-poem-pencil-sharpener",
    author: "가현",
    year: "",
    ageAtTime: "",
    type: "poem",
    collection: "가현이의 어린 시절 시",
    title: "연필깎기 할머니",
    image: "web/gahyun-poem-pencil-sharpener.jpeg",
    thumb: "thumbnails/gahyun-poem-pencil-sharpener.jpeg",
    description: "연필을 다듬어주는 연필깎기에 할머니의 사랑을 빗댄 시.",
    bodyText: `연필깎기 할머니
박가현

연필깎기는 연필의 뭉툭한 면을 다듬어 준다

할머니도 우리의 뭉툭한 면을 다듬어 주신다

잘못한 점이 있을 땐 연필깎기의 칼날처럼

잘라 주시고 아직 서툰 면을 매끄럽게 만들어 주신다.

… 더 깎을 수 …

난 그때 할머니가 만족하는 어른이겠지?`,
    public: true,
  },
  {
    id: "gahyun-poem-jandibat",
    author: "가현",
    year: "",
    ageAtTime: "",
    type: "poem",
    collection: "가현이의 어린 시절 시",
    title: "잔디밭에서 풀 뽑는 사람",
    image: "web/gahyun-poem-jandibat.jpeg",
    thumb: "thumbnails/gahyun-poem-jandibat.jpeg",
    description: "저녁마다 잔디밭에서 잡초를 뽑는 할머니를 바라보며 쓴 시.",
    bodyText: `잔디밭에서 풀 뽑는 사람
박가현

항상 시간은 흐른다.
시간이 흐르면 모든 생명은 죽기도 하고 살기도 한다

할머니는 어김없이 저녁이 되면
풀을 뽑으러 잔디밭으로 나오신다

잔디밭에는 변하지 않는 것이 있다

잔디밭에는 항상 잔디가 있고
잔디에 붙어 생명을 앗는 잡초도 있다는 것이다

할머니는 항상 잡초를 뽑으신다.
할머니의 눈에 보인 잡초는 절대 없어지지 않을 수 없다.

친구가 뽑힐 땐 옆 친구가 긴장하고
또 그 옆 친구가 긴장한다

잔디밭에는 긴장이 있다.
그러나 잔디밭에는 언제나 생명이 숨쉬기에 아름답다.

잔디밭에서는 지금도 시간이 흐르고 있다.`,
    public: true,
  },

  // ── ② 그때의 편지와 낙서 ──
  {
    id: "gahyun-2004-letter",
    author: "가현",
    year: 2004,
    ageAtTime: "",
    type: "letter",
    collection: "그때의 편지와 낙서",
    title: "엄마 아빠께",
    image: "web/gahyun-2004-letter.jpeg",
    thumb: "thumbnails/gahyun-2004-letter.jpeg",
    description: "동생이 태어난 것을 기뻐하며 부모님께 감사를 전한 편지. 2004년 3월 8일.",
    bodyText: `엄마 아빠께

(앞부분 두 줄은 판독 불가)

엄마 아빠 저를 이렇게 키워 주셔서 감사합니다
그리고 저를 나아 주셔서 감사합니다
그리고 세 번째 동생도 잘 돌볼게요
… 저는 이제 부모가 될게요 (엄마 아빠가)

추신 항상 사랑해요

2004년 3월 8일 토요일
가현이가`,
    public: true,
  },
  {
    id: "jiyong-bear-birthday-card",
    author: "지용",
    year: "",
    ageAtTime: "",
    type: "letter",
    collection: "그때의 편지와 낙서",
    title: "사랑하는 엄마께 (곰돌이 카드)",
    image: "web/jiyong-bear-birthday-card.jpeg",
    thumb: "thumbnails/jiyong-bear-birthday-card.jpeg",
    description: "곰돌이 모양으로 오려 만든 생일 카드. 시험을 앞두고 엄마를 걱정하는 마음이 담겨 있다.",
    bodyText: `사랑하는 엄마께

엄마, 안녕하세요! 저 지용이에요. 엄마의 생일을 맞아서 이 편지를 써요.
6월 24일 오늘은 시험을 쳤어요. 사회 배운 대로 잘 친 것 같아요.
사회는 앞으로 좀 더 노력해서 시험을 칠게요.
엄마가 병원에서 힘들어하실까봐 ABC 초콜릿을 드렸어요. 먹고 힘 내요 엄마, 사

엄마를 사랑하는 지용 씀`,
    public: true,
  },
  {
    id: "jiyong-2007-thanks",
    author: "지용",
    year: 2007,
    ageAtTime: "",
    type: "letter",
    collection: "그때의 편지와 낙서",
    title: "엄마 아빠께",
    image: "web/jiyong-2007-thanks.jpeg",
    thumb: "thumbnails/jiyong-2007-thanks.jpeg",
    description: "받아쓰기를 도와준 것, 아이스크림을 사준 것 등 소소한 순간에 감사를 전한 편지. 2007년 5월 7일.",
    bodyText: `엄마, 아빠께
엄마, 아빠 저 지용이여요
아빠 제가 받아쓰기 할 때 도와주셔서 감사합니다
또 아이스크림을 사주셔서 감사합니다
엄마 어린이날 선물 사주셔서 감사합니다
또 수영할 때 … 감사합니다
… 을 다 해주셔 감사합니다
아빠 제가 배 아플 때 치료해주셔서 감사
엄마 아빠 사랑해요

사랑하는 아들 지용 올림
2007년 5월 7일 월요일`,
    public: true,
  },
  {
    id: "gahyun-contract-2009",
    author: "가현",
    year: 2009,
    ageAtTime: "",
    type: "note",
    collection: "그때의 편지와 낙서",
    title: "계약서 (약속 20가지)",
    image: "web/gahyun-contract-2009.jpeg",
    thumb: "thumbnails/gahyun-contract-2009.jpeg",
    description: "동생들과 싸우지 않기, 숙제 열심히 하기 등 스스로 정한 20가지 약속. 2009년 9월 12일, 지용·영현과 같은 날 함께 썼다.",
    bodyText: `계약서

나 박가현은…
1. 동생들과 싸우지 않겠습니다
2. 숙제를 열심히 하겠습니다
3. 엄마 아빠 할머니 말을 잘 듣겠습니다
4. 매일 앵글리쉬듀오를 하겠습니다
5. 매일 풀줄넘기 30분을 하겠습니다
6. 할머니를 열심히 돕겠습니다
7. 동생들을 배려하겠습니다
8. 이기적인 사람이 되지 않겠습니다
9. TV시간을 지키겠습니다 (평일 약 1시간, 주말 약 1시간 30분)
10. 컴퓨터시간을 지키겠습니다 (매일 30분씩)
11. 공부를 열심히 하겠습니다
12. 타임캡슐 문 열기 전에 5권 읽겠습니다
13. 옷은 이불장 내가 정리하겠습니다
14. 수업시간에 집중하고 숙제를 빼먹지 않겠습니다
15. 먹는 것 가지고 싸우지 않겠습니다
16. 아침에 화가 나더라도 화를 내지 않겠습니다
17. 나를 위해 노력하겠습니다
18. 10시에 취침하고 6시 30분에 기상하겠습니다
19. 부모님께 짜증내지 않겠습니다
20. 한 가지 약속을 끝까지 노력하겠습니다

위 사항을 준수하겠습니다.
2009. 9. 12  박가현`,
    public: true,
  },
  {
    id: "jiyong-contract-2009",
    author: "지용",
    year: 2009,
    ageAtTime: "",
    type: "note",
    collection: "그때의 편지와 낙서",
    title: "계약서",
    image: "web/jiyong-contract-2009.jpeg",
    thumb: "thumbnails/jiyong-contract-2009.jpeg",
    description: "할머니 말씀 잘 듣기, TV·컴퓨터 시간 지키기 등 스스로 정한 약속. 2009년 9월 12일.",
    bodyText: `계약서

1. 할머니 말씀을 잘 듣겠다
2. TV시간은 7시 20분에서 8시 20분 그러니까 딱 한 시간만 보겠습니다
3. 컴퓨터는 주말은 한 시간, 평일에는 3분 딴짓하는 것 3분 보겠다
4. 잔소리를 듣지 않도록 노력하겠다
5. 일어나자마자 이를 닦겠다
6. 집에 오면 숙제를 바로 하겠다
7. 부모님 말씀에 순종하겠다
8. 싸우지 않겠다
9. 말할 때 손장난 안 하겠다
10. 양보를 하겠다

2009. 9. 12  박지용`,
    public: true,
  },
  {
    id: "younghyun-contract-2009",
    author: "영현",
    year: 2009,
    ageAtTime: "",
    type: "note",
    collection: "그때의 편지와 낙서",
    title: "계약서와 사과 메모",
    image: "web/younghyun-contract-2009.jpeg",
    thumb: "thumbnails/younghyun-contract-2009.jpeg",
    description: "할머니 돕기, 공부 열심히 하기 등의 약속과, 그 뒤에 엄마에게 화해를 청하는 짧은 메모. 2009년 9월 12일.",
    bodyText: `할머니를 많이 도와주고, 말 잘 듣고, 언니랑 오빠랑 잘 지내고,
공부 열심히 하고, 책 많이 읽고, 텔레비전 조금 보고,
책상 정리, 옷장 그리고 방 청소, 서로 돕고 잘 지내고,
짜증 내지 않고, 싸우지 않고, 부모님 말씀 잘 듣고, 양보 잘하고,
언니 오빠 말 잘 듣고, 책 일주일에 8권 읽을게요.

to mama에게

언니가 속을 썩여서 죄송해요.
엄마 기분 상하게 하지 마세요.
그래도 언니 오빠하고 잘 지켜줄게요.
엄마 아자 아자 파이팅!!

2009년 9월 12일  박영현`,
    public: true,
  },
  {
    id: "jiyong-apology-2009",
    author: "지용",
    year: 2009,
    ageAtTime: "",
    type: "note",
    collection: "그때의 편지와 낙서",
    title: "그만 화 푸세요",
    image: "web/jiyong-apology-2009.jpeg",
    thumb: "thumbnails/jiyong-apology-2009.jpeg",
    description: "계약서를 쓴 뒤, 잘못을 인정하며 엄마에게 화해를 청한 짧은 편지.",
    bodyText: `이번 일은 내가 좀 잘못한 것 같다.
뭐 그러니 이젠 규칙도 있고 벌칙도 있으니
앞에 있는 계약서대로 하도록 노력하겠다.
이어서 편지

To 엄마에게

엄마, 안녕하세요 저 지용이에요.
오늘 일은 제가 잘못했고 계약서도 적었으니까 그만 화 푸세요.
이젠 할머니랑 엄마 말씀도 잘 들을게요.
엄마, 사랑해요~♡
엄마가 좋아하는 커피향 갈색~

그만 화 푸세요.
지용 올림`,
    public: true,
  },
  {
    id: "gahyun-2010-birthday-certificate",
    author: "가현",
    year: 2010,
    ageAtTime: "",
    type: "note",
    collection: "그때의 편지와 낙서",
    title: "엄마 생일 증서",
    image: "web/gahyun-2010-birthday-certificate.jpeg",
    thumb: "thumbnails/gahyun-2010-birthday-certificate.jpeg",
    description: "'이쁜것들을 사랑하는 모임' 명의로 엄마에게 장난스럽게 써준 생일 증서. 2010년 6월 26일.",
    bodyText: `6.26. 김양희 양 태어남. 그와 함께 그녀의 반쪽 김경희 양도 태어남.
무럭무럭 크며 「고구마씬」 등과 같은 코믹으로 전 세계를 180° 뒤집어 놓은
죄로 밖에서 잠옷차림으로 물벼락을 맞기도 함. 그러나 특유의 인사를
한 대가로 석방됨. 그러나 죄를 뉘우치지 않고 아리따운 외모로 남자들을
홀리고 대다수 여자들의 선망이자 질투의 대상이 됨.

헌법 제246조 — 이쁜 것도 죄다.

너무 이쁜 나머지 사형감이 된 김양희 양. 그러나 탁월한 미술실력을
인정받아 무죄가 됨. 그러나 그 미술실력을 그녀의 이쁘고 사랑스럽고
새초롬하고 깐지나고 늘씬한 딸 가현의 수행평가에 기가 막히게
(사적허용) 쓰이도록 함.

2010.6.26.  이쁜것들을 사랑하는 모임
이사회장 박가현`,
    public: true,
  },
  {
    id: "younghyun-2012-dad-letter",
    author: "영현",
    year: 2012,
    ageAtTime: "",
    type: "letter",
    collection: "그때의 편지와 낙서",
    title: "사랑하는 아빠께",
    image: "web/younghyun-2012-dad-letter.jpeg",
    thumb: "thumbnails/younghyun-2012-dad-letter.jpeg",
    description: "아빠가 늘 놀아주고 바른 길로 인도해준 것에 감사를 전한 편지. 2012년 4월 29일.",
    bodyText: `사랑하는 아빠께

아빠, 저 영현이에요. 아빠는 저를 낳아 주시지 않았지만 저랑 항상
재미있게 놀아주시고 바른 길로 인도해 주셔서 감사해요.
제가 아플 때마다 고쳐주시고 치료해주셔서 감사해요.
아빠 병원에도 자주 놀러갈 수 있으면 좋겠어요.
그리고 제가 부탁할 게 있는데요, 좀 배불리 먹어요.
그리고 술 많이 마시고 돌아다니지 말고 집에서 좀 쉬고,
술 좀 마세요! 아빠 살찌면 사랑이 빨리 죽는데요.

정말 우리 아빠는 자기 챙기기도 힘든데 저 같은 날쌘 남을 만나서
그나마 다행이지, 하긴 이렇게 좋은 딸 낳았으니 얼마나 좋은지
엄마도 참 복 받은 거야. 능력있고 착한 아빠 만나서 이런 똑똑한
딸 낳았잖아요. 그리고 위의 충고를 잊지 말아요.

2012.4.29
똑똑한 딸 영현이 올림
착한 아빠께`,
    public: true,
  },
  {
    id: "jiyong-2012-parents-letter",
    author: "지용",
    year: 2012,
    ageAtTime: "",
    type: "letter",
    collection: "그때의 편지와 낙서",
    title: "사랑하는 부모님께",
    image: "web/jiyong-2012-parents-letter.jpeg",
    thumb: "thumbnails/jiyong-2012-parents-letter.jpeg",
    description: "중학교 입학을 앞두고 지난 13년을 돌아보며 부모님께 감사와 다짐을 전한 편지. 2012년 9월 26일.",
    bodyText: `사랑하는 부모님께

부모님 안녕하세요? 저는 부모님의 자랑스러운 아들 지용이에요.
엄마와 아빠가 저를 낳아주신지 벌써 13년이나 되었어요.
이제 제가 벌써 중학교에 들어가네요.
제가 중학교 가서도 엄마 아빠 언제나 건강하셔야 되요.
이제와서 생각해 보니까 제가 어렸을 때도 부모님은 언제나 열심히
일을 하셨네요. 제가 이제 … 가니까 앞으로는 집안일도 잘 도와드릴게요.
부모님이 저를 위해 열심히 … 저도 어른이 되면 부모님 위해
열심히 일할게요. 그리고 갈 때는 부모님 건강해지라고 드리는 거니까
꼭 드세요. 엄마, 아빠 영원히 사랑해요~♡

2012년 9월 26일
지용 올림`,
    public: true,
  },
  {
    id: "younghyun-2012-chuseok-letter",
    author: "영현",
    year: 2012,
    ageAtTime: "",
    type: "letter",
    collection: "그때의 편지와 낙서",
    title: "사랑하는 부모님께 (추석)",
    image: "web/younghyun-2012-chuseok-letter.jpeg",
    thumb: "thumbnails/younghyun-2012-chuseok-letter.jpeg",
    description: "추석을 맞아 할머니께 드리려던 편지지에 대신 부모님께 쓴 편지. 공부와 진로에 대한 다짐이 담겨 있다. 2012년 9월 26일.",
    bodyText: `사랑하는 부모님께

안녕하세요? 저는 (알 수 없음)영현이에요. 저 지금 추석 기념으로
어떻게 편지를 씁니다. 원래는 할머니께 드리는 건데 갑자기가 없으니…
저는 엄마, 아빠 함께인데 가끔 너무 힘들게 해서 죄송합니다ㅠㅠ
저는 제 집안도 너무 힘들고 (사춘기) 학교공부도 지켜요.
그래도 많이 힘들고 있어요. 그래도 그런 후 많이 후회합니다(?)
그래서 가끔 너무 죄송해요. 그래도 응석 부려서 감사해요.
공부 열심히 해서 꼭 좋은 대학 갈게요.
나중에 훌륭한 사람 되면 역사책&기타에 실어드리기로~♥
엄마, 아빠 걱정하지 마세요.

2012. 9. 26 수
부모님 건강 기원하는 영현 올림`,
    public: true,
  },
  {
    id: "jiyong-2012-grandma-letter",
    author: "지용",
    year: 2012,
    ageAtTime: "",
    type: "letter",
    collection: "그때의 편지와 낙서",
    title: "사랑하는 부모님, 할머니께",
    image: "web/jiyong-2012-grandma-letter.jpeg",
    thumb: "thumbnails/jiyong-2012-grandma-letter.jpeg",
    description: "할머니가 2년 동안 부모님을 대신해 돌봐주신 것에 감사를 전한 편지.",
    bodyText: `사랑하는 부모님, 할머니께

엄마, 아빠, 안녕하세요? 저는 지용이에요.
아빠, 저를 낳아주신 지 정말 감사합니다.
그리고 할머니, 3학년 때부터 5학년 때까지 저를 길러주셔서 정말 감사합니다.
저는 엄마, 아빠, 그리고 할머니 덕분에 이렇게 클 수 있었던 것 같아요.
부모님이 저를 길러주신 지도 벌써 13년이 됐네요.
그리고 할머니는 2년 동안 저희 부모님을 대신해서 저를 돌봐주셨지요.
제가 어버이날 드릴 수 있는 건 이런 편지밖에 없지만
나중에 크면 더 많은 것을 해 드릴게요 ^^~

효자 지용 올림`,
    public: true,
  },
  {
    id: "gahyun-rainbow-letter",
    author: "가현",
    year: "",
    ageAtTime: "",
    type: "letter",
    collection: "그때의 편지와 낙서",
    title: "부모님께 (무지개 편지)",
    image: "web/gahyun-rainbow-letter.jpeg",
    thumb: "thumbnails/gahyun-rainbow-letter.jpeg",
    description: "무지개 색으로 줄을 그어 꾸민 편지. 동생을 잘 챙기고 심부름도 잘하겠다는 다짐이 담겨 있다.",
    bodyText: `부모님께

엄마, 아빠, 우리가 자라는데 많은 사랑을 주셔서 감사합니다.
그리고 무럭무럭 자라게 많은 필요한 영양분을 주셔서 감사합니다.
나를 낳아주시고 키워주신 은혜 잊지 않겠습니다.
동생들 저 챙기고 정신이 없으시겠지만, 이제 동생도 잘 돌보고
심부름도 잘 할게요. 정성을 담아서

가현 올림`,
    public: true,
  },

  // ── ③ 작성자를 찾고 있어요 ──
  {
    id: "unknown-birthday-stickers",
    author: "",
    year: "",
    ageAtTime: "",
    type: "note",
    collection: "작성자를 찾고 있어요",
    title: "HAPPY BIRTHDAY 스티커 편지",
    image: "web/unknown-birthday-stickers.jpeg",
    thumb: "thumbnails/unknown-birthday-stickers.jpeg",
    description: "엄마의 마흔네 번째 생일을 축하하며 스티커 글자로 꾸민 편지. 누가 썼는지 아직 확인되지 않았다.",
    bodyText: `엄마! 44번째 생일을 진심으로 축하해요!!
아마 44번째… 맞죠? ㅎㅎ 지금은 5시 30분!
엄마가 Come 하기 30분 전이네요^^ 이 파일을 다 채울 수 있으려는지ㅡㅡ 그래도 노력을!!!
어때요? 정성이 가득 담긴 거 맞죠? ㅎㅎ
물질적인 것보다는 역시 정성이에요^^
학교생활 아주 잘 해내고 있죠♥ 싫어하는 아이랑 억지로 놀 수는 없는…

HAPPY BIRTHDAY♥`,
    public: true,
  },
  {
    id: "unknown-postit-singuiru",
    author: "",
    year: "",
    ageAtTime: "",
    type: "note",
    collection: "작성자를 찾고 있어요",
    title: "포스트잇 메모 — 「신기루」",
    image: "web/unknown-postit-singuiru.jpeg",
    thumb: "thumbnails/unknown-postit-singuiru.jpeg",
    description: "단편소설 「신기루」를 쓰겠다는 다짐이 담긴 노란 포스트잇 세 장. 누가 썼는지 아직 확인되지 않았다.",
    bodyText: `…거니깐요~ 하하하^^ 지금 TV에 하고 있어요^^ 엇! 할머니가 밥 먹으라
I will be back!♥ ㅋㅋㅋㅋ 아까 생각이 떠올랐지요!!! ㅎㅎ 제가 엄마…
단편소설을 하나 써드리죠록 하죠^^★ 음… 뭘로 정할까요? ㅋㅋ 정했다!!! 소설 제목은

신기루!!!

…우와~ 기대하세요~>_< 나의 실력을 유감없이 보이니 ㅎㅎ 마미!! 그럼 빠이요~
…해요!!!>_<
소설을 쓰러 가야겠군!
좋다 봅시다 ^^ㅎㅎ`,
    public: true,
  },
  {
    id: "unknown-poem-foggy-day",
    author: "",
    year: "",
    ageAtTime: "",
    type: "poem",
    collection: "작성자를 찾고 있어요",
    title: "안개 끼는 우울한 날",
    image: "web/unknown-poem-foggy-day.jpeg",
    thumb: "thumbnails/unknown-poem-foggy-day.jpeg",
    description: "안개 낀 날, 창가에 앉아 커피를 마시며 느낀 우울한 감상을 적은 시. 누가 썼는지 아직 확인되지 않았다.",
    bodyText: `안개 끼는 우울한 날

안개 낄 때 창에 앉아 커피를 마시며 책을 보면
우울한 미소를 짓는다.
너는 나도 아무 말 없이 큰 소파 끝에 혼자 앉아
조용히 커피를 마시거나, 책을 읽거나 그냥 앉아
먼저 말을 꺼내도 말이 없는 우울한 사람들.`,
    public: true,
  },
];
