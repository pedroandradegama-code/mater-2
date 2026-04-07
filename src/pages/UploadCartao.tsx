import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type UploadState = "validating" | "idle" | "dragging" | "uploading" | "processing" | "success" | "error" | "invalid_token";

export default function UploadCartao() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<UploadState>("validating");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [userId, setUserId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [confianca, setConfianca] = useState<number | null>(null);

  useEffect(() => {
    if (!token) { setState("invalid_token"); return; }
    validateToken(token);
  }, [token]);

  async function validateToken(t: string) {
    const { data, error } = await supabase
      .from("upload_tokens")
      .select("user_id, expires_at, usado")
      .eq("token", t)
      .single();

    if (error || !data) { setState("invalid_token"); return; }
    if (data.usado) {
      setErrorMsg("Este link já foi utilizado. Peça à gestante um novo link.");
      setState("invalid_token");
      return;
    }
    if (new Date(data.expires_at) < new Date()) {
      setErrorMsg("Este link expirou. Peça à gestante um novo link.");
      setState("invalid_token");
      return;
    }

    setUserId(data.user_id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("nome")
      .eq("user_id", data.user_id)
      .single();

    if (profile?.nome) setPatientName(profile.nome);
    setState("idle");
  }

  const processFile = useCallback(async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      setErrorMsg("Por favor, envie um arquivo PDF.");
      setState("error");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg("O arquivo deve ter no máximo 20MB.");
      setState("error");
      return;
    }

    setFileName(file.name);
    setState("uploading");
    setProgress(15);

    try {
      const filePath = `${userId}/${Date.now()}_prontuario.pdf`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from("cartoes-gestante")
        .upload(filePath, file, { contentType: "application/pdf" });

      if (storageError) throw new Error(`Erro no upload: ${storageError.message}`);
      setProgress(40);

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setProgress(55);

      setState("processing");
      setProgress(65);

      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        "pdf-cartao-gestante",
        {
          body: { pdfBase64: base64, userId, pdfUrl: storageData?.path },
          headers: token ? { "x-upload-token": token } : {},
        }
      );

      if (fnError) throw new Error(fnError.message);
      if (!fnData?.ok) throw new Error(fnData?.error ?? "Erro desconhecido");

      setProgress(100);
      setConfianca(fnData.confianca);
      setState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro desconhecido. Tente novamente.");
      setState("error");
    }
  }, [userId, token]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (state === "idle") setState("dragging");
  };
  const onDragLeave = () => {
    if (state === "dragging") setState("idle");
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Fraunces:ital,wght@0,500;1,400&display=swap" rel="stylesheet" />

      <div style={{ marginBottom: "40px", textAlign: "center" }}>
        <p style={{ fontFamily: "'Fraunces', serif", fontSize: "28px", fontWeight: 500, color: "#1a1a1a", margin: 0 }}>mater</p>
        <p style={{ fontSize: "13px", color: "#888", margin: "4px 0 0" }}>Cartão da Gestante Digital</p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e8e4df", borderRadius: "20px", padding: "40px", width: "100%", maxWidth: "480px", boxShadow: "0 2px 20px rgba(0,0,0,0.04)" }}>

        {state === "validating" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
            <p style={{ fontSize: "17px", fontWeight: 500, color: "#1a1a1a", margin: 0 }}>Validando link...</p>
          </div>
        )}

        {state === "invalid_token" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔒</div>
            <p style={{ fontSize: "17px", fontWeight: 500, color: "#1a1a1a", margin: "0 0 8px" }}>Link inválido ou expirado</p>
            <p style={{ fontSize: "14px", color: "#e53e3e", lineHeight: 1.6, margin: 0 }}>
              {errorMsg || "Peça à gestante que gere um novo link pelo aplicativo Mater."}
            </p>
          </div>
        )}

        {(state === "idle" || state === "dragging") && (
          <>
            {patientName && (
              <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "10px", padding: "12px 16px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "16px" }}>👤</span>
                <div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#16a34a" }}>Paciente</p>
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: 500, color: "#14532d" }}>{patientName}</p>
                </div>
              </div>
            )}
            <p style={{ fontSize: "17px", fontWeight: 500, color: "#1a1a1a", margin: "0 0 8px" }}>Enviar prontuário em PDF</p>
            <p style={{ fontSize: "14px", color: "#888", margin: "0 0 24px", lineHeight: 1.6 }}>
              Exporte o prontuário do seu sistema e faça o upload abaixo. Os dados serão extraídos automaticamente para o cartão da gestante.
            </p>
            <label
              htmlFor="pdf-input"
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `2px dashed ${state === "dragging" ? "#E91E8C" : "#d4cfc8"}`, borderRadius: "14px", padding: "40px 24px", cursor: "pointer", background: state === "dragging" ? "#FFF0F8" : "#FAFAF8", transition: "all 0.2s ease", gap: "12px" }}
            >
              <input id="pdf-input" type="file" accept="application/pdf" onChange={onFileChange} style={{ display: "none" }} />
              <div style={{ fontSize: "40px" }}>📄</div>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "15px", fontWeight: 500, color: "#1a1a1a" }}>
                  {state === "dragging" ? "Solte aqui" : "Clique ou arraste o PDF"}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#aaa" }}>PDF até 20MB</p>
              </div>
            </label>
            <p style={{ fontSize: "12px", color: "#bbb", marginTop: "20px", textAlign: "center", lineHeight: 1.5 }}>
              O arquivo é processado com segurança e não fica armazenado permanentemente.
            </p>
          </>
        )}

        {(state === "uploading" || state === "processing") && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "20px" }}>
              {state === "uploading" ? "⬆️" : "🔍"}
            </div>
            <p style={{ fontSize: "17px", fontWeight: 500, color: "#1a1a1a", margin: "0 0 8px" }}>
              {state === "uploading" ? "Enviando arquivo..." : "Extraindo dados clínicos..."}
            </p>
            <p style={{ fontSize: "13px", color: "#888", margin: "0 0 24px" }}>
              {state === "uploading" ? fileName : "A IA está lendo o prontuário e preenchendo o cartão da gestante"}
            </p>
            <div style={{ background: "#f0ece8", borderRadius: "100px", height: "6px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #E91E8C, #FF6B9D)", borderRadius: "100px", transition: "width 0.5s ease" }} />
            </div>
            <p style={{ fontSize: "12px", color: "#bbb", marginTop: "10px" }}>{progress}%</p>
          </div>
        )}

        {state === "success" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "64px", height: "64px", background: "#F0FDF4", border: "2px solid #86EFAC", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "28px" }}>
              ✓
            </div>
            <p style={{ fontSize: "20px", fontWeight: 500, color: "#14532d", margin: "0 0 8px" }}>Cartão atualizado!</p>
            <p style={{ fontSize: "14px", color: "#666", margin: "0 0 24px", lineHeight: 1.6 }}>
              {patientName
                ? `O cartão de ${patientName} foi atualizado com sucesso.`
                : "O cartão da gestante foi atualizado com sucesso."
              }{" "}
              Ela já pode visualizar as informações no aplicativo Mater.
            </p>
            {confianca !== null && (
              <div style={{ background: "#F8F8F6", border: "1px solid #e8e4df", borderRadius: "10px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#888" }}>Qualidade da extração</span>
                <span style={{ fontSize: "13px", fontWeight: 500, color: confianca >= 0.8 ? "#16a34a" : confianca >= 0.5 ? "#d97706" : "#dc2626" }}>
                  {Math.round(confianca * 100)}% — {confianca >= 0.8 ? "Excelente" : confianca >= 0.5 ? "Parcial" : "Limitada"}
                </span>
              </div>
            )}
            <p style={{ fontSize: "12px", color: "#bbb", marginTop: "20px" }}>Pode fechar esta janela.</p>
          </div>
        )}

        {state === "error" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚠️</div>
            <p style={{ fontSize: "17px", fontWeight: 500, color: "#1a1a1a", margin: "0 0 8px" }}>Algo deu errado</p>
            <p style={{ fontSize: "14px", color: "#888", margin: "0 0 24px" }}>{errorMsg}</p>
            <button
              onClick={() => { setState("idle"); setErrorMsg(""); setFileName(""); setProgress(0); }}
              style={{ background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 28px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>

      <p style={{ fontSize: "12px", color: "#ccc", marginTop: "24px" }}>mater • dados protegidos por criptografia</p>
    </div>
  );
}
