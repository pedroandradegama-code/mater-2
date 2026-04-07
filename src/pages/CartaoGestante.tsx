import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CartaoData {
  dum: string | null;
  dpp_clinico: string | null;
  dpp_usg: string | null;
  tipo_gravidez: string | null;
  risco: string | null;
  gravidez_planejada: boolean | null;
  grupo_sanguineo: string | null;
  antecedentes_familiares: Record<string, boolean | null>;
  antecedentes_clinicos: Record<string, boolean | null>;
  gestas_previas: Record<string, number | boolean | null>;
  gestacao_atual: Record<string, boolean | null>;
  exames: Array<{ nome: string; data: string | null; resultado: string }>;
  ultrassonografias: Array<{
    data: string | null;
    ig_dum: string | null;
    ig_usg: string | null;
    peso_fetal: string | null;
    placenta: string | null;
    liquido: string | null;
    outros: string | null;
  }>;
  consultas_cartao: Array<{
    data: string | null;
    ig_semanas: number | null;
    peso_kg: number | null;
    pa: string | null;
    au_cm: number | null;
    bcf: string | null;
    apresentacao: string | null;
    edema: boolean | null;
    conduta: string | null;
  }>;
  vacinas: Record<string, unknown>;
  ultimo_pdf_processado_em: string | null;
  confianca_extracao: number | null;
}

type Tab = "consultas" | "exames" | "ultrassom" | "gestacao" | "antecedentes";

export default function CartaoGestante() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [cartao, setCartao] = useState<CartaoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("consultas");
  const [gerandoLink, setGerandoLink] = useState(false);
  const [linkGerado, setLinkGerado] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchCartao();
  }, [user]);

  async function fetchCartao() {
    setLoading(true);
    const { data } = await supabase
      .from("cartao_gestante")
      .select("*")
      .eq("user_id", user!.id)
      .single();
    setCartao(data as CartaoData | null);
    setLoading(false);
  }

  async function gerarLink() {
    setGerandoLink(true);
    await supabase
      .from("upload_tokens")
      .update({ usado: true })
      .eq("user_id", user!.id)
      .eq("usado", false);

    const { data, error } = await supabase
      .from("upload_tokens")
      .insert({ user_id: user!.id })
      .select("token")
      .single();

    if (error || !data) {
      toast({ title: "Erro ao gerar link", variant: "destructive" });
      setGerandoLink(false);
      return;
    }

    const link = `${window.location.origin}/upload/cartao?token=${data.token}`;
    setLinkGerado(link);
    setGerandoLink(false);
  }

  async function copiarLink() {
    if (!linkGerado) return;
    await navigator.clipboard.writeText(linkGerado);
    toast({ title: "Link copiado!" });
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--color-text-secondary)" }}>Carregando cartão...</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "consultas", label: "Consultas" },
    { id: "exames", label: "Exames" },
    { id: "ultrassom", label: "Ultrassom" },
    { id: "gestacao", label: "Gestação atual" },
    { id: "antecedentes", label: "Antecedentes" },
  ];

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "24px 16px 80px" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: "13px", padding: "0 0 12px", display: "flex", alignItems: "center", gap: "4px" }}
        >
          ← Voltar
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 500 }}>Cartão da Gestante</h1>
            {cartao?.ultimo_pdf_processado_em && (
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--color-text-secondary)" }}>
                Atualizado em {new Date(cartao.ultimo_pdf_processado_em).toLocaleDateString("pt-BR")}
                {cartao.confianca_extracao !== null && (
                  <span style={{
                    marginLeft: "8px",
                    background: cartao.confianca_extracao >= 0.8 ? "#F0FDF4" : "#FFFBEB",
                    color: cartao.confianca_extracao >= 0.8 ? "#16a34a" : "#d97706",
                    borderRadius: "4px", padding: "1px 6px", fontSize: "11px",
                  }}>
                    {Math.round(cartao.confianca_extracao * 100)}% completo
                  </span>
                )}
              </p>
            )}
          </div>
          <Button onClick={gerarLink} disabled={gerandoLink} size="sm">
            {gerandoLink ? "Gerando..." : "📤 Enviar para médico"}
          </Button>
        </div>
      </div>

      {/* Link gerado */}
      {linkGerado && (
        <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "12px", padding: "16px", marginBottom: "24px" }}>
          <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 500, color: "#1d4ed8" }}>
            Link gerado — válido por 7 dias
          </p>
          <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>
            Envie este link para o seu médico. Ele fará o upload do prontuário em PDF sem precisar de conta no Mater.
          </p>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <code style={{ flex: 1, background: "#fff", borderRadius: "6px", padding: "8px 10px", fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", border: "1px solid #e2e8f0" }}>
              {linkGerado}
            </code>
            <Button size="sm" variant="outline" onClick={copiarLink}>Copiar</Button>
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {!cartao && (
        <div style={{ border: "2px dashed #e2e8f0", borderRadius: "16px", padding: "48px 32px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
          <h2 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 500 }}>Cartão ainda não preenchido</h2>
          <p style={{ margin: "0 0 24px", fontSize: "14px", color: "#64748b", lineHeight: 1.6, maxWidth: "320px", marginInline: "auto" }}>
            Gere um link e envie para o seu médico. Ele fará o upload do prontuário e o cartão será preenchido automaticamente.
          </p>
          <Button onClick={gerarLink} disabled={gerandoLink}>
            {gerandoLink ? "Gerando link..." : "Gerar link para o médico"}
          </Button>
        </div>
      )}

      {/* Conteúdo do cartão */}
      {cartao && (
        <>
          {/* Identificação */}
          {(() => {
            const items = [
              { label: "DUM", value: cartao.dum ? new Date(cartao.dum).toLocaleDateString("pt-BR") : null },
              { label: "DPP clínico", value: cartao.dpp_clinico ? new Date(cartao.dpp_clinico).toLocaleDateString("pt-BR") : null },
              { label: "DPP USG", value: cartao.dpp_usg ? new Date(cartao.dpp_usg).toLocaleDateString("pt-BR") : null },
              { label: "Tipo", value: cartao.tipo_gravidez ? cartao.tipo_gravidez.charAt(0).toUpperCase() + cartao.tipo_gravidez.slice(1).replace("_", " ") : null },
              { label: "Risco", value: cartao.risco ? cartao.risco.charAt(0).toUpperCase() + cartao.risco.slice(1).replace("_", " ") : null },
              { label: "Sangue", value: cartao.grupo_sanguineo },
            ].filter(i => i.value);
            if (!items.length) return null;
            return (
              <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "20px", marginBottom: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "16px" }}>
                {items.map(item => (
                  <div key={item.label}>
                    <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "15px", fontWeight: 500 }}>{item.value}</p>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Tabs */}
          <div style={{ display: "flex", gap: "4px", overflowX: "auto", marginBottom: "20px", borderBottom: "1px solid #e2e8f0" }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 14px", fontSize: "13px", fontWeight: tab === t.id ? 500 : 400, color: tab === t.id ? "#0f172a" : "#64748b", background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap", borderBottom: tab === t.id ? "2px solid #0f172a" : "2px solid transparent", marginBottom: "-1px" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Aba Consultas */}
          {tab === "consultas" && (
            <>
              {(!cartao.consultas_cartao || cartao.consultas_cartao.length === 0) && (
                <p style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: "14px" }}>Nenhuma consulta registrada ainda.</p>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[...(cartao.consultas_cartao ?? [])].reverse().map((c, i) => (
                  <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <p style={{ margin: 0, fontWeight: 500, fontSize: "14px" }}>
                        {c.data ? new Date(c.data).toLocaleDateString("pt-BR") : "Data não informada"}
                      </p>
                      {c.ig_semanas && (
                        <span style={{ background: "#EFF6FF", color: "#1d4ed8", fontSize: "12px", padding: "2px 8px", borderRadius: "6px" }}>
                          {c.ig_semanas}s
                        </span>
                      )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                      {c.pa && <div><p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>PA</p><p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 500 }}>{c.pa}</p></div>}
                      {c.peso_kg && <div><p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>Peso</p><p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 500 }}>{c.peso_kg} kg</p></div>}
                      {c.au_cm && <div><p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>AU</p><p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 500 }}>{c.au_cm} cm</p></div>}
                      {c.bcf && <div><p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>BCF</p><p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 500 }}>{c.bcf}</p></div>}
                      {c.apresentacao && <div><p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>Apresentação</p><p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 500 }}>{c.apresentacao}</p></div>}
                      {c.edema !== null && <div><p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>Edema</p><p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 500 }}>{c.edema ? "Sim" : "Não"}</p></div>}
                    </div>
                    {c.conduta && (
                      <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                        <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Conduta</p>
                        <p style={{ margin: "4px 0 0", fontSize: "13px" }}>{c.conduta}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Aba Exames */}
          {tab === "exames" && (
            <>
              {(!cartao.exames || cartao.exames.length === 0) && (
                <p style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: "14px" }}>Nenhum exame registrado ainda.</p>
              )}
              {cartao.exames && cartao.exames.length > 0 && (
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                  {cartao.exames.map((e, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 100px 1fr", gap: "12px", padding: "12px 16px", fontSize: "13px", borderBottom: i < cartao.exames.length - 1 ? "1px solid #f1f5f9" : "none", background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                      <span style={{ fontWeight: 500 }}>{e.nome}</span>
                      <span style={{ color: "#94a3b8" }}>{e.data ? new Date(e.data).toLocaleDateString("pt-BR") : "—"}</span>
                      <span>{e.resultado || "—"}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Aba Ultrassom */}
          {tab === "ultrassom" && (
            <>
              {(!cartao.ultrassonografias || cartao.ultrassonografias.length === 0) && (
                <p style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: "14px" }}>Nenhuma ultrassonografia registrada ainda.</p>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[...(cartao.ultrassonografias ?? [])].reverse().map((u, i) => (
                  <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
                    <p style={{ margin: "0 0 12px", fontWeight: 500, fontSize: "14px" }}>
                      {u.data ? new Date(u.data).toLocaleDateString("pt-BR") : "Data não informada"}
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      {u.ig_dum && <div><p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>IG (DUM)</p><p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 500 }}>{u.ig_dum}</p></div>}
                      {u.ig_usg && <div><p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>IG (USG)</p><p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 500 }}>{u.ig_usg}</p></div>}
                      {u.peso_fetal && <div><p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>Peso fetal</p><p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 500 }}>{u.peso_fetal}</p></div>}
                      {u.placenta && <div><p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>Placenta</p><p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 500 }}>{u.placenta}</p></div>}
                      {u.liquido && <div><p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>Líquido amniótico</p><p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 500 }}>{u.liquido}</p></div>}
                      {u.outros && <div><p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>Outros</p><p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 500 }}>{u.outros}</p></div>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Aba Gestação atual */}
          {tab === "gestacao" && (() => {
            const labels: Record<string, string> = {
              fumo: "Tabagismo", alcool: "Álcool", outras_drogas: "Outras drogas",
              violencia_domestica: "Violência doméstica", anemia: "Anemia",
              hipertensao: "Hipertensão arterial", pre_eclampsia: "Pré-eclâmpsia",
              diabetes_gestacional: "Diabetes gestacional", inf_urinaria: "Infecção urinária",
              ciur: "CIUR", oligo_polidramnio: "Oligo/polidrâmnio",
              uso_insulina: "Uso de insulina", sifilis: "Sífilis",
              toxoplasmose: "Toxoplasmose", hiv: "HIV/Aids",
            };
            const entries = Object.entries(labels)
              .map(([k, l]) => ({ k, l, v: (cartao.gestacao_atual ?? {})[k] }))
              .filter(e => e.v !== null && e.v !== undefined);
            if (!entries.length) return <p style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: "14px" }}>Dados da gestação atual não registrados.</p>;
            return (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {entries.map(e => (
                  <div key={e.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", borderRadius: "8px", padding: "10px 14px" }}>
                    <span style={{ fontSize: "13px" }}>{e.l}</span>
                    <span style={{ fontSize: "12px", fontWeight: 500, padding: "2px 8px", borderRadius: "4px", background: e.v ? "#FEF2F2" : "#F0FDF4", color: e.v ? "#dc2626" : "#16a34a" }}>
                      {e.v ? "Sim" : "Não"}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Aba Antecedentes */}
          {tab === "antecedentes" && (() => {
            const secoes = [
              {
                titulo: "Antecedentes familiares",
                labels: { hipertensao: "Hipertensão", diabetes: "Diabetes", gemelar: "Gemelar" },
                dados: cartao.antecedentes_familiares ?? {},
                tipo: "bool",
              },
              {
                titulo: "Antecedentes clínicos",
                labels: { cardiopatia: "Cardiopatia", inf_urinaria: "Inf. urinária", hipertensao: "Hipertensão", diabetes: "Diabetes", tromboembolismo: "Tromboembolismo", cir_pelv_uterina: "Cir. pélvica/uterina", infertilidade: "Infertilidade" },
                dados: cartao.antecedentes_clinicos ?? {},
                tipo: "bool",
              },
              {
                titulo: "Gestas anteriores",
                labels: { gestas: "Gestações", partos_vaginais: "Partos vaginais", cesareas: "Cesáreas", abortos: "Abortos", nascidos_vivos: "Nascidos vivos" },
                dados: cartao.gestas_previas ?? {},
                tipo: "num",
              },
            ];
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {secoes.map(s => {
                  const entries = Object.entries(s.labels)
                    .map(([k, l]) => ({ k, l, v: s.dados[k] }))
                    .filter(e => e.v !== null && e.v !== undefined);
                  if (!entries.length) return null;
                  return (
                    <div key={s.titulo}>
                      <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8" }}>{s.titulo}</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        {entries.map(e => (
                          <div key={e.k} style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", borderRadius: "8px", padding: "10px 14px" }}>
                            <span style={{ fontSize: "13px" }}>{e.l}</span>
                            {s.tipo === "bool" ? (
                              <span style={{ fontSize: "12px", fontWeight: 500, padding: "2px 8px", borderRadius: "4px", background: e.v ? "#FEF2F2" : "#F0FDF4", color: e.v ? "#dc2626" : "#16a34a" }}>
                                {e.v ? "Sim" : "Não"}
                              </span>
                            ) : (
                              <span style={{ fontSize: "13px", fontWeight: 500 }}>{String(e.v)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
