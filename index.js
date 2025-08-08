
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

// Load department contacts from JSON file
const contactsPath = path.join(__dirname, "data", "contacts.json");
let DEPT = {};

function loadContacts() {
  try {
    const raw = fs.readFileSync(contactsPath, "utf8");
    DEPT = JSON.parse(raw);
    console.log(`[INIT] Loaded ${Object.keys(DEPT).length} departments`);
  } catch (e) {
    console.error("[ERROR] Failed to load contacts.json:", e.message);
    DEPT = {};
  }
}
loadContacts();

// Health check
app.get("/health", (req, res) => res.status(200).send("OK"));

// Kakao sample: sayHello
app.post("/api/sayHello", (req, res) => {
  return res.json({
    version: "2.0",
    template: {
      outputs: [{ simpleText: { text: "안녕" } }]
    }
  });
});

// Kakao sample: showHello (image)
app.post("/api/showHello", (req, res) => {
  return res.json({
    version: "2.0",
    template: {
      outputs: [
        {
          simpleImage: {
            imageUrl:
              "https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/brand/brandCharacter/ryan.png",
            altText: "라이언이 손을 흔들어요"
          }
        }
      ]
    }
  });
});

// Main skill: major counseling card
app.post("/api/majorCounsel", (req, res) => {
  const deptName =
    req.body?.action?.params?.RISE_name ||
    req.body?.action?.detailParams?.RISE_name?.value ||
    "";

  const info = DEPT[deptName];
  
  // GET 요청이 들어왔을 때 안내
app.get("/api/majorCounsel", (req, res) => {
  res.status(405).send("이 API는 POST 방식만 지원합니다. JSON 형식으로 호출하세요.");
});


  if (!info) {
    const quickReplies = Object.keys(DEPT)
      .slice(0, 8)
      .map((name) => ({
        action: "message",
        label: name,
        messageText: `${name} 상담 안내`
      }));

    return res.json({
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text:
                "학과명을 정확히 인식하지 못했어요 😥\n" +
                "아래에서 학과를 선택하거나 '웹툰', '펫'처럼 키워드로 다시 물어봐 주세요."
            }
          }
        ],
        quickReplies
      }
    });
  }

  const text =
    `안녕하세요! ${deptName}에 관심 가져주셔서 감사합니다 😊\n` +
    `해당 전공에 대한 궁금증은 아래 담당 교수님께 1:1 상담 요청하실 수 있습니다.\n\n` +
    `👩‍🏫 담당 교수: ${info.prof}\n` +
    `📞 전화번호: ${info.phone}`;

  return res.json({
    version: "2.0",
    template: {
      outputs: [
        {
          basicCard: {
            title: `🎓 ${deptName} 상담 안내`,
            description: text,
            buttons: [
              {
                action: "webLink",
                label: "📎 RISE 공식 인스타그램",
                webLinkUrl: info.homepage
              },
              {
                action: "webLink",
                label: "💬 오픈채팅",
                webLinkUrl: info.openchat
              }
            ]
          }
        }
      ],
      quickReplies: [
        { action: "message", label: "다른 학과", messageText: "다른 학과 상담" }
      ]
    }
  });
});

// For Render port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Skill server listening on ${PORT}`);
});
