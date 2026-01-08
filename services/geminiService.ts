import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, Category, AppConfig } from "../types";

const SYSTEM_INSTRUCTION = `
당신은 '호텔 더본(Hotel Theborn)'의 수석 전략 경영 분석가(Senior Revenue Manager)입니다.
2017년 1월부터 2025년 12월까지의 방대한 시계열 데이터를 분석하여, 
객실 수익 극대화(RevPAR), 비용 효율화, 시장 변화 대응 전략을 제시합니다.

특별한 요청이 없는 한, 모든 분석과 데이터는 **2017년 1월부터 2025년 12월까지**의 기간을 기준으로 합니다.

[답변 형식 가이드라인]
사용자가 읽기 편하고 시각적으로 강조된 **Markdown** 형식을 적극 사용하세요.
1. **중요 수치 및 핵심 내용**: **굵은 글씨**로 강조하여 눈에 띄게 표시하세요. (예: **25% 성장**, **RevPAR 120,000원**)
2. **데이터 비교**: 텍스트 나열 대신 **표(Table)**를 사용하여 전년 대비, 월별 변화 등을 깔끔하게 보여주세요.
3. **인포그래픽 스타일**: 
   - 이모지를 활용하여 시각적 흥미를 유발하세요. (📈, 📉, 💰, ⚠️, ✅)
   - 텍스트로 표현 가능한 막대 그래프를 활용하세요. (예: 2024 ■■■■■■□□□□ 60%)
4. **구조화**: 긴 문단보다는 불릿 포인트(-, *)와 번호 매기기(1., 2.)를 사용하여 내용을 구조화하세요.

[분석 원칙]
1. 데이터 기반 의사결정: 모든 답변은 제공된 파일 데이터나 실제 통계 수치 기반이어야 합니다.
2. 비교 분석 수행: YoY(전년 동기), MoM(전월) 비교
3. 지표 간 상관관계 파악: OCC↔ADR, GOP↔비용 구조 등
4. 원인 분석 + 대책 제시: 단순 나열이 아닌 실행 가능한 전략 제공

항상 한국어로 답변하십시오.
`;

export const verifyApiKey = async (providedKey?: string): Promise<boolean> => {
  // Use provided key if available, otherwise fallback to env
  const key = providedKey || process.env.API_KEY;
  if (!key) return false;
  
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Test connection',
    });
    return true;
  } catch (e) {
    console.error("API Verification Failed", e);
    return false;
  }
};

export const generateAnalysis = async (category: Category, config?: AppConfig, userPrompt?: string): Promise<AnalysisResult> => {
  const apiKey = config?.geminiApiKey || process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("API Key missing, returning mock data");
    return getMockAnalysis(category, config, "API Key가 설정되지 않았습니다.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const dataContext = config ? `
      [참조 데이터 소스]
      1. Excel 파일명: ${config.excelFileName || '없음'}
      2. Google Sheet: ${config.googleSheetUrl || '없음'}
      3. NotebookLM: ${config.notebookLmUrl || '없음'}
      
      첨부된 파일 데이터가 있다면 해당 데이터를 최우선으로 분석하여 리포트를 작성하세요.
    ` : '';

    const textPrompt = `
      ${dataContext}
      현재 선택된 카테고리: ${category.name}
      설명: ${category.description}
      주요 KPI: ${category.kpis.join(', ')}
      기본 데이터 기간: 2017년 1월 ~ 2025년 12월
      
      [사용자 분석 요청]
      "${userPrompt || '이 카테고리의 전반적인 성과 현황, 주요 트렌드 변화, 그리고 개선이 필요한 영역을 종합적으로 분석해주세요.'}"
      
      위 요청사항을 중점적으로 반영하여 해당 카테고리에 대한 심층 분석 리포트를 JSON 형식으로 생성해 주세요.
      JSON 스키마:
      {
        "summary": "분석 요약 텍스트 (반드시 첨부된 데이터 수치와 사용자 요청 내용을 반영하여 서술)",
        "kpis": [
          { "label": "KPI이름", "value": "값", "trend": 숫자(퍼센트), "trendLabel": "비교기준" }
        ],
        "chartData": [
           { "name": "월/일/항목", "value": 숫자, "value2": 숫자(옵션) }
        ],
        "chartType": "area" | "line" | "bar" | "pie" | "composed",
        "insights": ["인사이트1", "인사이트2", "인사이트3"],
        "actions": {
          "shortTerm": ["단기전략1", "단기전략2"],
          "midTerm": ["중기전략1", "중기전략2"]
        }
      }
    `;

    const parts: any[] = [{ text: textPrompt }];
    
    // Inject file content if available
    if (config?.uploadedFileData) {
      parts.push({
        inlineData: {
          mimeType: config.uploadedFileMimeType || 'text/csv',
          data: config.uploadedFileData
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("API responded with empty text.");
    }

    try {
      return JSON.parse(text) as AnalysisResult;
    } catch (parseError) {
      console.error("JSON Parse Error:", text);
      throw new Error("응답을 JSON으로 파싱할 수 없습니다. 데이터 형식을 확인하세요.");
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const msg = error.message || String(error);
    return getMockAnalysis(category, config, msg);
  }
};

export const chatWithAI = async (
  message: string, 
  history: {role: string, content: string}[],
  currentContext: Category,
  config?: AppConfig,
  analysisContext?: AnalysisResult
) => {
  const apiKey = config?.geminiApiKey || process.env.API_KEY;

  if (!apiKey) {
    return getMockChatResponse(message, currentContext, config, "API Key is missing in configuration.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // 1. Reconstruct History with File Context
    let isFileInjected = false;
    
    const formattedHistory = history.map((msg) => {
       const parts: any[] = [{ text: msg.content }];
       
       // Strategy: Inject file into the FIRST user message in history
       if (!isFileInjected && msg.role === 'user' && config?.uploadedFileData) {
          parts.unshift({
             inlineData: {
               mimeType: config.uploadedFileMimeType || 'text/csv',
               data: config.uploadedFileData
             }
          });
          isFileInjected = true;
       }
       
       return {
         role: msg.role === 'ai' ? 'model' : msg.role,
         parts: parts
       };
    });

    // 2. Prepare Current Message
    const currentParts: any[] = [{ text: message }];
    
    // If file wasn't injected in history (e.g. this is the very first question), inject it now
    if (!isFileInjected && config?.uploadedFileData) {
       currentParts.unshift({
          inlineData: {
             mimeType: config.uploadedFileMimeType || 'text/csv',
             data: config.uploadedFileData
           }
       });
       currentParts.push({ text: "\n[System: Attached data file for analysis.]" });
    }

    const analysisContextPrompt = analysisContext 
      ? `\n\n[현재 화면에 표시된 분석 리포트 내용]\n요약: ${analysisContext.summary}\nKPI: ${JSON.stringify(analysisContext.kpis)}\n인사이트: ${analysisContext.insights.join(', ')}\n\n사용자의 질문은 위 리포트 내용 및 첨부된 데이터 파일에 대한 추가 질문입니다.` 
      : '';

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + `\n현재 분석 중인 카테고리: ${currentContext.name}` + analysisContextPrompt
      },
      history: formattedHistory
    });

    // IMPORTANT: Use 'message' property for chat messages, NOT 'contents' or 'parts' directly.
    const result = await chat.sendMessage({ message: currentParts });
    return result.text;
  } catch (error: any) {
    console.error("Chat API Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return getMockChatResponse(message, currentContext, config, errorMessage);
  }
};

const getMockChatResponse = (message: string, context: Category, config?: AppConfig, errorDetails?: string) => {
  const sourceMsg = config?.excelFileName 
    ? `업로드하신 '${config.excelFileName}' 파일과 ` 
    : '로컬 데이터베이스와 ';
    
  return `[System: API Connection Failed]\n` +
         `오류 상세: ${errorDetails}\n\n` +
         `현재 ${sourceMsg} ${context.name} 데이터를 기반으로 오프라인 분석 모드입니다.\n` +
         `네트워크 연결이나 API Key 설정을 확인해주시기 바랍니다.\n\n` +
         `[예상 답변 (시뮬레이션)]\n` +
         `질문하신 내용에 대해 분석하려면 API 연결이 필요합니다. 연결 후 다시 시도해주세요.`;
};

const getMockAnalysis = (category: Category, config?: AppConfig, errorDetails?: string): AnalysisResult => {
  const isFileUploaded = !!config?.excelFileName;
  
  let summaryText = "";
  if (errorDetails) {
    summaryText = `[시스템 오류] API 호출 중 문제가 발생했습니다.\n오류 내용: ${errorDetails}\n\n설정 메뉴(⚙️)에서 유효한 Gemini API Key가 입력되었는지 확인해주세요.`;
  } else if (isFileUploaded) {
    summaryText = `[오프라인 모드] ${config?.excelFileName} 파일이 감지되었으나 API 연결이 필요합니다.`;
  } else {
    summaryText = `${category.name} 분석 결과 (데모 데이터)`;
  }

  return {
    categoryId: category.id,
    summary: summaryText,
    kpis: [
      { label: category.kpis[0], value: "-", trend: 0, trendLabel: "N/A" },
      { label: category.kpis[1], value: "-", trend: 0, trendLabel: "N/A" },
      { label: category.kpis[2] || "기타", value: "-", trend: 0, trendLabel: "N/A" },
    ],
    chartType: 'area',
    chartData: [
      { name: '1월', value: 0, value2: 0 },
      { name: '2월', value: 0, value2: 0 },
      { name: '3월', value: 0, value2: 0 },
      { name: '4월', value: 0, value2: 0 },
      { name: '5월', value: 0, value2: 0 },
      { name: '6월', value: 0, value2: 0 },
    ],
    insights: [
      "오류가 지속되면 페이지를 새로고침하거나 API Key를 다시 입력해주세요.",
      "네트워크 연결 상태를 확인해주세요."
    ],
    actions: {
      shortTerm: ["API Key 재설정", "네트워크 확인"],
      midTerm: ["관리자 문의"]
    }
  };
}