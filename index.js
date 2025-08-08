// index.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

// === contacts.json 로드 ===
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

// === 헬스체크 ===
app.get("/health", (_req, res) => res.status(200).send("OK"));

// === 샘플 엔드포인트 ===
app.all("/api/sayHello", (_req, res) => {
  res.json({
    version: "2.0",
    template: { outputs: [{ simpleText: { text: "안녕" } }] }
  });
});

app.all("/api/showHello", (_req, res) => {
  res.json({
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

// === 메인 스킬: GET/POST 모두 JSON 반환 ===
app.all("/api/majorCounsel", (req, res) => {
  try {
    const deptName =
      req.body?.action?.params?.RISE_name ||
      req.body?.action?.detailParams?.RISE_name?.value ||
      req.query?.RISE_name ||
      "";

    const info = DEPT[deptName];

    const kakaoText = (text) => ({
      version: "2.0",
      template: { outputs: [{ simpleText: { text } }] }
    });

    if (!deptName) {
      return res.json(
        kakaoText(
          "학과명을 인식하지 못했어요 😥\n'웹툰', '펫', '디저트'처럼 키워드로 다시 물어봐 주세요."
        )
      );
    }

    if (!info) {
      const quickReplies = Object.keys(DEPT).slice(0, 8).map((name) => ({
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
                  `‘${deptName}’로는 학과를 찾지 못했어요 😥\n` +
                  `아래에서 학과를 선택하거나 키워드로 다시 질문해 주세요.`
              }
            }
          ],
          quickReplies
        }
      });
    }

    const desc =
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
              description: desc,
              buttons: [
                {
                  action: "webLink",
                  label: "📎 학과 안내 페이지",
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
  } catch (e) {
    console.error("[majorCounsel] error:", e);
    return res.json({
      version: "2.0",
      template: {
        outputs: [
          { simpleText: { text: "요청 처리 중 오류가 발생했어요 😥 잠시 후 다시 시도해 주세요." } }
        ]
      }
    });
  }
});

// === 포트 바인딩 ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Skill server listening on ${PORT}`));
