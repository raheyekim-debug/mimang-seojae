export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: '허용되지 않은 요청입니다.' });
  }

  const key = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-6-astra';
  if (!key) return res.status(500).json({ error: '서버 설정이 아직 완료되지 않았습니다.' });

  const { category, story, tone } = req.body || {};
  const allowedCategories = ['그리움', '사랑', '우정', '가족', '위로', '추억'];
  const allowedTones = ['고전적이고 서정적인', '담백하고 짧은', '깊고 사색적인', '따뜻하고 다정한'];
  if (!allowedCategories.includes(category) || !allowedTones.includes(tone) || typeof story !== 'string' || story.trim().length < 5 || story.length > 500) {
    return res.status(400).json({ error: '입력 내용을 확인해 주세요. 사연은 5~500자로 작성해 주세요.' });
  }

  try {
    // Screen user-submitted text before generation.
    const moderation = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'omni-moderation-latest', input: story })
    });
    if (!moderation.ok) throw new Error('moderation_unavailable');
    const moderationData = await moderation.json();
    if (moderationData.results?.[0]?.flagged) {
      return res.status(400).json({ error: '이 내용은 시 생성에 사용할 수 없어요. 안전하고 편안한 주제로 다시 적어 주세요.' });
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        max_output_tokens: 500,
        instructions: `너는 한국어 문학 브랜드 '미망서재'의 시 창작자다. 사용자의 사연을 바탕으로 독창적인 한국어 시를 쓴다. 선택한 분위기: ${tone}. 감정 카테고리: ${category}. 상투적인 표현을 피하고 구체적인 장면과 자연스러운 한국어를 사용한다. 사용자가 말하지 않은 사실이나 관계를 지어내지 않는다. 위험하거나 노골적인 내용을 미화하지 않는다. 시 제목과 본문만 다음 JSON 형식으로 반환한다: {"title":"제목","poem":"시 본문"}.`,
        input: `다음 사연을 바탕으로 JSON 형식으로 제목과 시 본문을 작성해 주세요.

사연:
${story}`,
        text: { format: { type: 'json_object' } }
      })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('OpenAI API error', response.status, JSON.stringify(err));
      return res.status(502).json({ error: 'AI 연결에 문제가 생겼어요. 잠시 후 다시 시도해 주세요.' });
    }
    const data = await response.json();
    const output = data.output_text || '';
    let poemData;
    try { poemData = JSON.parse(output); } catch { throw new Error('invalid_model_output'); }
    if (typeof poemData.title !== 'string' || typeof poemData.poem !== 'string') throw new Error('invalid_model_output');
    return res.status(200).json({ title: poemData.title.slice(0, 60), poem: poemData.poem.slice(0, 2500) });
  } catch (error) {
    console.error('Poem endpoint error', error.message);
    return res.status(503).json({ error: '현재 시를 만들 수 없어요. 잠시 후 다시 시도해 주세요.' });
  }
}
