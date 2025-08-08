// ✅ Accept both POST & GET and always return Kakao JSON
app.all("/api/majorCounsel", (req, res) => {
  try {
    // 1) 학과명 추출 (POST 바디 or GET 쿼리 모두 지원)
    const deptName =
      req.body?.action?.params?.RISE_name ||
      req.body?.action?.detailParams?.RISE_name?.value ||
      req.query?.RISE_name || // e.g. /api/majorCounsel?RISE_name=AI웹툰애니계열
      "";

    // 2) 학과 정보 조회
    const info = DEPT[deptName];

    // 3) 공통 응답 헬퍼
    const kakaoText = (text) => ({
      version: "2.0",
      template: { outputs: [{ simpleText: { text } }] }
    });

    if (!deptName) {
      // 바디/쿼리에 아무 값도 못 받았을 때도 JSON으로 안내
      return res.json(
        kakaoText(
          "학과명을 인식하지 못했어요 😥\n'웹툰', '펫', '디저트'처럼 키워드로 다시 물어봐 주세요."
        )
      );
    }

    if (!info) {
      // 학과 매칭 실패 시도 JSON 안내 + 퀵버튼
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

    // 4) 정상 카드 응답
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
    // 예외 발생해도 반드시 카카오 JSON으로 응답
    return res.json({
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text:
                "요청 처리 중 오류가 발생했어요 😥 잠시 후 다시 시도해 주세요."
            }
          }
        ]
      }
    });
  }
});
