import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ── localStorage hook ─────────────────────────────────────────────────────────
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

// ── SUPABASE CONFIG ───────────────────────────────────────────────────────────
const SUPABASE_URL = "https://igdwtfxihmjxvswrmdcq.supabase.co";
const SUPABASE_KEY = "sb_publishable_l17RqxeBO8NK-eEJ6GbjgQ_ZrxJW7V2";

// ── Supabase client (vanilla, no npm needed) ─────────────────────────────────
async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${sbGetToken() || SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

function sbGetToken() {
  try {
    const s = localStorage.getItem(
      `sb-${SUPABASE_URL.split("//")[1].split(".")[0]}-auth-token`
    );
    return s ? JSON.parse(s)?.access_token : null;
  } catch {
    return null;
  }
}

function sbGetUser() {
  try {
    const s = localStorage.getItem(
      `sb-${SUPABASE_URL.split("//")[1].split(".")[0]}-auth-token`
    );
    return s ? JSON.parse(s)?.user : null;
  } catch {
    return null;
  }
}

async function sbAuthFetch(path, body) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);
  if (data.access_token) {
    const key = `sb-${SUPABASE_URL.split("//")[1].split(".")[0]}-auth-token`;
    localStorage.setItem(key, JSON.stringify(data));
  }
  return data;
}

async function sbSignOut() {
  const key = `sb-${SUPABASE_URL.split("//")[1].split(".")[0]}-auth-token`;
  localStorage.removeItem(key);
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const NAVY = "#0F2044";
const NAVY2 = "#1A3260";
const ACCENT = "#2563EB";
const ACCENT2 = "#3B82F6";
const SLATE = "#64748B";
const SLATE2 = "#94A3B8";
const SUCCESS = "#10B981";
const DANGER = "#EF4444";
const WARNING = "#F59E0B";
const PINK = ACCENT;
const DARK = NAVY;
const LIGHT_BG = "#F1F5F9";
const COLORS = [
  ACCENT,
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#F97316",
];
const ALERT = 2000;

// ── Dark mode theming ─────────────────────────────────────────────────────────
function getTheme(dark) {
  return dark
    ? {
        BG: "#0D1117",
        CARD_BG: "#161B22",
        BORDER: "#30363D",
        SLATE: "#8B949E",
        SLATE2: "#6E7681",
        TEXT: "#E6EDF3",
        TEXT2: "#C9D1D9",
        NAV_BG: "#161B22",
        SIDEBAR_BG: "#0D1117",
        INPUT_BG: "#21262D",
      }
    : {
        BG: "#F1F5F9",
        CARD_BG: "#FFFFFF",
        BORDER: "#E2E8F0",
        SLATE: "#64748B",
        SLATE2: "#94A3B8",
        TEXT: "#0F2044",
        TEXT2: "#334155",
        NAV_BG: "#FFFFFF",
        SIDEBAR_BG: NAVY,
        INPUT_BG: "#F8FAFC",
      };
}

// Global theme — updated by App
let _dark = false;
let BG = "#F1F5F9";
let CARD_BG = "#FFFFFF";
let BORDER = "#E2E8F0";

// S is now a function that returns theme-aware styles
function makeS(theme) {
  return {
    card: {
      background: theme.CARD_BG,
      borderRadius: 12,
      padding: "20px 24px",
      border: `1px solid ${theme.BORDER}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      marginBottom: 16,
    },
    input: {
      padding: "9px 14px",
      borderRadius: 8,
      border: `1.5px solid ${theme.BORDER}`,
      fontSize: 14,
      width: "100%",
      outline: "none",
      marginBottom: 8,
      boxSizing: "border-box",
      background: theme.INPUT_BG,
      color: theme.TEXT,
      minWidth: 0,
      transition: "border-color .15s",
    },
    label: {
      fontSize: 12,
      color: theme.SLATE,
      fontWeight: 600,
      display: "block",
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    row: {
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
      alignItems: "flex-end",
      width: "100%",
    },
    danger: { color: DANGER, fontWeight: 700 },
    ok: { color: SUCCESS, fontWeight: 700 },
    tableHead: {
      background: theme.INPUT_BG,
      fontSize: 12,
      fontWeight: 700,
      color: theme.SLATE,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    },
    tableTd: {
      padding: "11px 16px",
      borderBottom: `1px solid ${theme.BORDER}`,
      fontSize: 14,
      color: theme.TEXT,
    },
  };
}
const S = makeS(getTheme(false)); // default, updated per component

function btn(active = true, danger = false) {
  return {
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    transition: "all .15s",
    background: danger ? "#FEF2F2" : active ? ACCENT : "#F1F5F9",
    color: danger ? DANGER : active ? "#fff" : SLATE,
    boxShadow: active && !danger ? `0 1px 3px ${ACCENT}40` : "none",
  };
}

// ── Knead Logo SVG ────────────────────────────────────────────────────────────
function KneadLogo({ size = 40, showText = true, light = false }) {
  const color = light ? "#ffffff" : "#0F2044";
  const sub = light ? "#94A3B8" : "#94A3B8";
  return (
    <svg
      width={showText ? size * 3.2 : size}
      height={size}
      viewBox={showText ? "0 0 128 40" : "0 0 40 40"}
    >
      {/* Icon */}
      <g transform="translate(2, 2)">
        {/* K stem */}
        <rect x="4" y="0" width="5" height="36" rx="1.5" fill={color} />
        {/* K upper arm */}
        <path
          d="M9 18 L28 0"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        {/* K lower arm */}
        <path
          d="M9 18 L28 36"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Whisk — positioned at junction of upper arm, more visible */}
        <g transform="translate(15, 3) rotate(-30)">
          {/* Handle */}
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="7"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Main balloon loop */}
          <path
            d="M0 7 Q-4 11 -3.5 16 Q0 19 3.5 16 Q4 11 0 7"
            stroke={color}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Inner wires */}
          <path
            d="M-1 8 Q-3.5 13 -2 17"
            stroke={color}
            strokeWidth="1.1"
            fill="none"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M1 8 Q3.5 13 2 17"
            stroke={color}
            strokeWidth="1.1"
            fill="none"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M0 7 Q0 13 0 17"
            stroke={color}
            strokeWidth="1.1"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>
      </g>
      {/* Text */}
      {showText && (
        <g transform="translate(40, 0)">
          <text
            x="0"
            y="26"
            fontFamily="Georgia, serif"
            fontSize="22"
            fontWeight="700"
            fill={color}
            letterSpacing="-0.5"
          >
            Knead
          </text>
          <text
            x="1"
            y="37"
            fontFamily="'Segoe UI', sans-serif"
            fontSize="7"
            fill={sub}
            letterSpacing="2"
          >
            BAKERY MANAGEMENT
          </text>
        </g>
      )}
    </svg>
  );
}

const LOGO_B64 =
  "data:image/png;base64,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8qEPfSh861vfGqh4i0y3fBaRaFBODR6p//b39+Xll1+W//E//kd47NgxuXjxogyHQ9nc3JT5+XnZ2dmR97///VE+WlpaEhH13d9ur3KNr3j+2c9+dqRDWa1mU4NtavDn5MmT8s53vjMQmQwSqTSLD/qwQvjoCm5V7lWd+e53vzu4/fbbw/hW1cvLy4Ga5FEl/6mB0CY7ieLnUgMCqnxde+21srKyMvP5DrVF9TPPPCPf+973wve+972B2gJXreyL15/b29szE5Lm5+flmWeeCf/P//k/sr29LSsra1EdpAYMFxcXo63JIdFEhDAM5eqrrw6WlpaiyUZqFbmIyMsvvyw/+tGPwvvuuy9IfgJDUQPO6lvA6+vrIiLy1FNPhZ/5zGdkPB7LlStX5LWvfa0899xz2luBx5/VaqBq8u3hQ9nd3ZW1tXW5cOGCjMdjOXnypBweHsrTTz8tFy5ckDAMwxtuuEGWlpZkfX1d1tfXZW1tTf09WFpaip5PatLA/Pz8TL7Z3d2V+fn5mfwbX+k7NzefGu+y1C4M73vf++SXv/xldK8WFhZka2tLDg4O5Mc//rEMBoPwIx/5SCAyaZOolegi051W4tvtq2ebuob//t//e7izsyMXL16Uq666KpqMcunSJbn99tvlzJkzUdtETUBBOxYWFuSd73xn8POf/zx8+umnZXl5OarPBoOBnDt3Tv7yL/8y/L3f+71geXk5agPHy258IpHKx+rcly5dkm9/+9vht7/97ai8XrlyRebn5+WFF16Q1772tXL77bcHqnwp8fP3mWpDqrbw2tqaXLhwIZqoIjJpp/7iF7+Qs2fPhq973euCwWAga2trUZmMTyAUkdhkByuXBAAAYA2tyxLoKAMAoF9UB9za2lq0ciq++rSog05991Stdj5//rx861vfCp944omoo/DKlSuyvr4uFy9ejLZBv+666+R973tftH202m5VDeBMB1VHhfG/99575f/7//4/WVpair4BrTrPzp8/L0899VS4uroaLC0tRasl1apyNaCjrmVpaUl+9atfhd/85jfl6aefluFwIVrB/aY3vUmefPLJaABpd3fX+jbu8a1v1UrsP/3TP5X/9t/+W7SC9ODgIBrUPnfunPyv//W/wj/90z8NlpeXtTvi4+Hfd999wblz58IHH3ww6gje2tqSjY0N2dvbky9+8Yvy+OOPh7/7u78bLC8vy6VLl+TYsWPR8fH7LiLR6qGnnnoq/PznPx9tFa0mXczNzcne3p488MADctddd82s+FXfWxexP8nBJNXRe8sttwTXXHNN+OKLL0YDSGrA/KqrrpLLly/PrD6//fbbZWNjIyqj8a30498eZpxmdnt7kdlPH5w8eVJOnjwZqMkbakBTDexV1fTW+fEB+fhK2FfjHtx6663ho48+KisrK7K0tBStbD04OJDvfve78qY3vSk8ceJEoLapFpGZLYnVAKwqj4888kj45S9/OdplRH064DWveY0899xzMyuOMSsIgmg3iaeffloODg5kb29PTp06Ff39q1/9qqytrYW33HLLzD1RW5fHJ0SpwfR//ud/Dr/xjW9Ek2tOnDghL7/8stxyyy1y9uxZrTjHP2WitvV/3/veJ3//938vg8EgqrNPnDghm5ub0eclfvWrX8nx48dFbfGfXD0/GAzCSd11TNbX1+X06dNyzTXXyOnTp+X48ePRtccn/qgBxfggui41MH/zzTcHH/jAB8IvfOELUflQO+4sLCzID3/4Q/nFL34R/tmf/Vlw/PjxaBJSfEKSyvfqnIeHh3LlyhX57Gc/G547dy6a2PDKK69EEwmuvvq0/MZv/EZ0rWqCoWonJdMNzVITJsbjsXzwgx+U//pf/2u0m0YQBNEuCC+//LL8p//0n8JPfvKTcsMNNwSq3aMmCqn7pO69moR18eJFefjhh8PHHntM5ufn5cKFC3Lq1CkRmTwLjh8/Lh/+8Iej9qzaHUZNZsJ0lxj13Hzta18r58+ff3UC2zCqn1544QX59re/LRcvXgxf//rXB2tra0fqHlVGy0weBqpoenIk0Ddtj1UVhUd5RpfRwiyQtsICAAB0m+qE3dvbk29+85uhWm2tvtNZ1IkUX+n87LPPyoULF6Ljtra2ZHFxMVqZqTrYl5eX5QMf+EC0+lt1cMVXQoqUezkJgkDe9KY3BQ8++GAYX+GovjcahqF8+ctflu9///vhO9/5TrnjjjtmvhetBhQHg4FcvHgx/Na3viWPPvqojMfjV7e4nXRUX3311fK+971PHnvsMVleXnZmhW58C321jez1118ffOQjHwk/97nPyXA4lMuXL0ffjL106ZKcO3dO/vqv/zr8xCc+EdQZ5ItTA/PD4VDm5+flPe95T/DLX/4y3N7ejr5P/qtf/UpuvPFGERF57LHH5OzZs+HNN98s73znO2VlZSWIf3tbuXLlipw/fz78yle+Ii+//LJsbW3J1VdfLS+99JJcunRJ1I4C1157rbz73e8O1OC7GrBR97goC8W3tVZ/xu+t6y/I8fLzlre8Rb7yla9EZXJ/fz8qD/FVbydOnJA77rhD9vf3ZWFhIdq2W2S6ffu0U9l+HrdJDXaotIsPGMYH1tWfyV0QiiYAqTDS6pKm8l7yEwnqTzX56Iknnojykfosh5rg8hd/8Rfypje9Kbznnnvkta99baC2e48bjUbyi1/8Ivz6178efTtdhTsej+XNb36zXHfddfL888+L+vZ1fHVg3y0uLkaDv/Pz8/KWt7xFXnnlFbl06VK048nOzo6cOnVKXnnlFfnCF74gt956a3j//ffLNddcE6hndLwuv3Llily4cCH86le/Kk888YQsLS1Fkx02NzflhhtukPe9733yqU99SivuCwsL0cro0Wgk+/v78ta3vjXY2NgIv/SlL8krr5yX06dPy9mzZ2U4HMrKyopcuXJFTp06lfn8VKvHx+OxnD9/Xs6fPy8///nPo+2Xjx8/Hl533XVy5swZeetb3xqoz7akTWbT7QBVA93D4VDe9a53BU8//XT49NNPy+XLl+X48eOys7MT1QNbW1vyH//jfwxf97rXyd133y133313EA8/Xm5+/vOfhz/96U/lsccei3YSGA6H0aS8MAxlZ2dH3v72t8u1114bxCf8JSdKwJzhcBjV+ddee23woQ99KPzqV78a5U81+UztHPCpT31KTp8+Hd59991y++23B+r75mpXGFVGz549Gz7zzDPyrW99S55//nk5ffp01G65ePGiLC0tycHBgTzwwANyww03BOrzQvHP7zAgN6HSVLVb7rjjDvnZz34mu7u70Tfr19fXJQxD+dnPfibPP/+8PPLII+H6+rqsrKxEk2qXl5dlf39fTp48KW9729uCPuxghHYln0eUX7cdbT9w/9rkQh8L0FcMoJdERQUAQH+o1VHb29vy0EMPiYhE3xAvM7ia/Da4WuU2GAxkdXU16lSfn5+X1dVVOXv2rPz5n/95cPr06WiFbHwLbxGJBu0nHdf5K6xGo5FsbGzIfffdJ9/97nejFbk7OzuytrYWDe6eP39evvSlL8kXv/jFcHV1Va6//npZXV2Vzc1NuXz5sly6dEm2t7ejuKvvoB8eTgbE7rvvPnnNa14TbGxshBcvXpSNjY1o63Sb1L1aWFiIvpe5sLAgb3jDG4Lf+I3fCL/4xS9G242Ox2O56qqr5OLFi/Lyyy/L3/zN34R/9Ed/pNXwi3fm7+3tybFjx+RjH/uYfPazn301PbfkxhtvlCtXrsju7q6cOnVKLl26JD/+8Y/l0UcflcXFxfDaa6+Vq6++WoIgkMuXL8vFixfl8uXLsr29HX3bfn19PRqcu+qqq6JV9R//+MeD1dXVqP0aX5U5+RZ6t1foqbTf39+Xu+++O/jmN78Zbm9vS3xSQrws7O7uyo033ig33XRTIDJdwa7SU5mucuv3QE38vUgNpsUn/MQHnUWmA4pqVwtXzE6KmG7/+/rXvz644YYbwhdeeEF2dnZkZWUlWim8vr4uBwcH8tOf/lTtvBGeOHFCTpw4EX1a4cKFC3L27NlopebBwYEcHh7K+vq6bG9vy7Fjx+Tee++V+fn5KEy1andra8tiirhBDc7Ft7S//fbbg+985zvh9va27O3tyeLioiwuLsorr7wix44dk83NTfnJT34ijz32mCwuLoanT5+WM2fORLu9nD9/Xi5duiQ7OzsiInLVVVdF24EvLy/L/Py8/M7v/E5w4cIF7d7fg4ODaLKIyGSV9P7+vrz+9a8PXvOa18j3vvdw+O1vfzt6Pm1ubsry8nK0g0t88o4S/5TLwcFh9H3zlZUVCcNQdnd35amnnpKnnnpKvv3tb4f33HOP3HfffXLNNdcE8U9VNLE7jJp4pCbGfOxjHws+9alPhcvLy3LhwoXoZ2rS4NLSkjzzzDPyzDPPyGc/+9nw5MmTcu2118ra2ppcvHhRXnnllej77aqeVt9xV2VkeXlZtre35c/+7M/kda+7OVD1jHq2x+MG81Q+mpubkze/+c3BxYsXw4cffjja9WEwGMjJkyej+uzll1+Wr371q/KlL30pXF5eluuvv15Onz4tu7u7onYa2NzcjL5/ftNNN8nzzz8vKysrUVl/8cUX5bd/+7fl13/91wOR6e4DKh7xXaL6LD6hTT3jbrnllmBjYyOclNlhNMlFrSrf29uT559/PtohQtVLqv186623yr333vvqeVmFDgAA+iUaQE97SXNVG3Fz+frbML3+ei8heStGyqSt7gqnpu5f3fOUPa7o+myHryvv/JOfHY3nbNzLrbLMEv+uXtrvJ1eQ9q3c9+16lel1d+f6XbmXTdYpeatIJj/TO398harIZOBEDWCoDkC1oiXeEVVlZbLqBI9vL6rCUt8VH4/HcuONN8pHPvIROX36tIhMO7/iq19Vh7VakVW2A+vee+8NLl68GD722GOyu7sbdbaLTL9vqK73ypUr8uMf/zj6Xvrq6mq06k19X1QNlAVBIP/qX/0redvb3hZlvtXV1WhFvYjMrJoXkaije9Khl73KTmRyj9UgiboH8XOruKtOU7Utrlq9LyKx1dbTVcZLS0vyjne8I3jxxRfDxx9/XIIgkOXlZdnc3IzS4sknn5TPfe5z4Qc/+MEgPsCl8kOZLWLVgMVwOIy2tr3uuuuCP/qjP5LPf/7z4S9+8UvZ2dmJvlO7tbUVpbHK+88995z86le/msmLKi3U4Lka3FtbW5Nnn31WTp48KX/0R38kJ06ciOKRVGYL9/gWu/GJIPv7+zPbA6tvvce36s4KN35/TVN5QX2r94//+I+Dy5cvh4899pg8/PDD0aCciv/W1pa8613vEpHpamkRmfmubny72SJFdXKVOttEmqmJAOoeq28Lq613y6xAjQ/yxdMpvtI6Xo9VGTxXeT2+KlsNjqg4q3uX3AK67Dda4/dR1fEq7oPBQD760Y8Gn/70p8MLFy7IsWPHooHzeHkcjUayubkpW1tb0eBDfAJBGIbRNRwcHMju7q4sLy/Lxz72MbnllluCl156SQ4PD0O1C4k6f3xQPb66cvr/6WmWdp/UCt319XU5f/58tCo6mb5qwoPa6jt+jrTzqmtVzzNVf6r4xgc447sJJCctpFH1erxOGQwG8ru/+7vBZz7zmfD555+PzjMcDqNJRfF888ILL8gLL7wQPQ/iWxqrT2OoFazHjh2T3/qt35KNjY1oB4DxeCwLCwsz+UtEXt0yenZ75CQ1KBUfoFL3c2VlRd7znvcEp06dCj//+c9H34wWmXyeQ8VP5XdVPuMD6AsLC7K9vT2zq4jKw2pF+mOPPSaPPfaY3H///eH73//+YDgcRvVi8l7WpfLW8vKyfPKTnwy++93vhg8++OBMfETkyIS6ixcvysWLF3PTbjgcRu0ydZ/f+973yute97pAZJqH4nkkGW6W+H1TbYv4NuKqbaEmDibfHYvCUOVgb29vpp2i/lQTtMIwjHbJUdtmTz+zUl+8zaKuQ00YPDw8TE2LKn0SKm+r+nJ5eVne//73B9dcc034hS98Qfb392U8Hkd5W32HO/7t7SeffFKefPLJmU8LqPbY/v6+nD9/XlZWVqLJkFtbW/KOd7wjGjxPi1f5rfuDqG0bzz9qxXV8MpO61tkB6ZLBZIgP9Kt6X03Wa+J5r/K02iZfTeT64Ac/KH/9138tBwejaAce9SxQ9ba69t3d3ej5Gt99a5IWdrbwLdtuKnp+ZZ2nj1sTp6WV6f7HJs+jG2ba8VX6qk2Jt5lMhGXinG2VjybfL9Oef3XOEz+mqP5J+70yTOR13eN10lw3LlnvJqbojo/phZn/b3V+p09m0kMzj3R7+QmA3ivTia3+A9AfarBAfQ91aWkp2qa5iS10VUelWkUVH/xUW7vfcsst8tGPflQ++tGPBrfeemtUCTXxDUfV0XXs2DH5zd/8zeC+++6LOgT39vaijlz13fP4oND8/LwcO3ZM9vb2ZGdnJ+oI3d/fjzqZP/zhD8ttt90WqI66+Pei1XXu7e1FnaaDwSDq6C+7Ol1dgxoQWFhYiFbAq477eN2tBgaSHcRp3v/+9wc333yzhGEoly5dktXVVVlfX5fNzU1ZWlqSH//4x/Ktb30rFJFoRb26vjId9GowUkSiQejxeCwnT56UP/zDPwzuvPPOqONcbW29s7Mje3t70bfR4wM38QGUw8NDWV1dlcXFRRkOh3Lu3Dl5+eWX5eabb5b3ve99cuONN2o/0FQ4IpMO3oWFhZlBweTkAPV5AFe+P6s6wdWg3vHjx+XUqVPBs88+G5VHNVCzubkpt956q7z2ta8NRJopf65TKzvVJyXUxIjV1VUnvnGq6giVl9QATHwy0dzcnOzu7sr29nZURpv6Ruv29rYcP35c/uAP/iC499575fLly7K7uyvHjh2bGWQeDoeyuLgoCwsLMwOfBwcHsrOzIwsLC7K4uBjVV8ePH5ff//3ff3UQcDrQsbCwEF3r6upqNElFlSl1TWVXD8cnSan0vHLlSvRpAhWeGqhTdZWqZ4rE74+6dlUfxyc6qO3X1be4y16DGshUE2AODw9lf39frrrqKvnoRz8a3HTTTTOTKNQkmCtXrkSrUlWaqTioe6bq08PDQ9nY2JATJ07Ie97zHnn9618fLC8vRwNG8QkCh4eH0fnKDG6qNIjvIqPC3dzclH/5l38J/+Zv/mZmAoJ6Bs/NzclVV10l6+vrUdqORqPoOR0Ek51xNjY2ZG1tTUajUZTf1C4Pqv7b2dmRxx57TL7whS+Eh4eHM6vidcQHWlR+WV5elje/+c3BBz7wAdnf34/aUep5Ed+uOz4hRv2Oug41iUcN4C0vL0sYhnLnnXfKu9/97sZe1tR9FZGZ+Kg0j09mOzg4kL29vVKD5yLTPK6e0fEyrJ6l8ed58ue6VP0YnwS3vb0to9GokTyQ3MlA3dvbbrst+PjHPx5NvoxPBLpw4YJsb2/L6upqNFlA/afSeGdnR7a2tqKBWzX4v7+/L/fff7+8//3vD8q074rs7OxE5VO1s9Qnf9R9VhNo1MQcVYc1sYODonYnGY/HsrKyEtUHulRdITJ7r1772tcGH/jAB6K2dRiGsrS0FE1SUIP4qlzH67/4Sn8A9sT7LtP+AwCY0f0eIgC9VXUFGI1OoF/ig7pqMF2tCNKdxaq2Y1WDKaqTXK0W/tCHPiRnzpwJ1BbdIhINUKdt31qVGsQ+ODiQlZUV+a3f+q3g+uuvDx966CF58cUXo5+JSDRIoToI1YoV1QmrVo6+9NJLcu2118pv/uZvypvffFcQ38JTrW6Kr1BWgxDqe4tqS9fJ+YoHudRAZnwVtIqr+ruKq+rYjq+Wz7OysiIf+tCHgv39/fCJJ56IOg/n5+ejb6Z/+9vflpWVlfBtb3tb9E10NfmgaJB1bm5upqNarTJaXFyUpaUl+chHPhJ85zvfCb/73e/KxYsXZXFxUdbW1uTw8FAuX74cDWSmrURUuxeorVFPnjwpt912mzzwwAPBqVOnGtkqO97prwb/1EQG1fGqOrbV9Yq49RyNbyE8HA7ll7/8ZXj27NnoO6oqPbe3t+Utb3lLVBe4dA2mqI7xwWAgGxsbcnBwIJubm9H21q5Qg8oqH6oJP5ubm9FgsMhk0Ony5cuNrT5YWVmJPr3wiU98IvjmN78ZfulLX5KXXnpJVldXRUSiuMRXUKoBdTUgqLbAPTg4kDNnzsi//tf/Wm655ZZAXc/JkyejAVE1WK5WW6odOETKTQqKU3lYDWCpyUWDwUA2Nzdn6juR2Ukj8dWWWeLxUgNRQRBEE4EWFhai64ivQK0af7XKVU3UERE5c+ZMtNr5oYceknPnzsnKyopsbGxEz3G1ilWlW3xFvCrnajDv93//9+WGG24IRETOnTsnr3nNa4LDw8MwPmCkJhvE06xM/FXY6lrG47E8/PDD4Ve/+jU5fvy4XL58eaaOuuqqq+RjH/uYioNcunRJLl26FG5tbUXP18m/X5BXXnlFnnnmGTk8PJRjx45F34RfWVmJtoFfXl6Wixcvyve//305c+ZMeN999zVSuanri+9gEwSBnDp1Sk6ePBlsbGyE3//+9+Xxxx+X+fl5OX78eLQDg7rW5LNNTXSI77Dy8ssvy+nTp+VP//RP5eabb25k8FRRg7cik+fz/Px81AZUK27V78Sfp/GVgXlUXonXDSIily5dmplcqdpE6jnbxASu8XgcTchTEyrUpEb1zNYVX4GuJn/Mz8/LrbfeGnziE58IH3roIXnsscei1e/D4VD29vaivBmfOBAEQTRBcjgcyqVLl+T48ePyyiuvyPr6uvzhH/6h3H777Y1NcFMTTERmdzsZj8fRZEA1CSS++0RTVF4TkahNp8qH7u4D6pxJ6v7cc889wR133CkPPfRQ+O1vf1vOnz8fTUI6PDyMdg1I1n/xHVEAAAD6hgF0tKYPHZJwX5WtvEyjTAD2xLesVSss1OqzMt/wLiq/qlN0dXVV1tbW5MSJE3LttdfK9ddfH1x11VUz8RCZHcxvglqxps45Go3kjjvuCK655hp59NFHwx/96EfRgLnqyFUdhQsLC7KzsxNt2XjlyhVZW1uT3/7t35b77rsvmKx6C6NBot3dXdnY2JDd3d2Zzue1tbWZb8arLSInHdD58Y9vqbqwsCAbGxuys7MTdUbv7+9H/6ZWCFWxt7cna2tr8oEPfCDY3t4Oz549KydPnpRz585FK+QuXLggDz74oJw4cSK88cYbA5VHRIq3CYsP3opMVy2qlenD4YK8+93vDt75znfKj370o/AHP/hBtN3wYDCQS5cuRR2rahWZWqGnVlTv7u7KrbfeKu9617vkmmuuib7dHf8uaF3JbY/V3+MDZCISdc5fuXJFVlZWot+13cmqJqwoBwcH8uCDD85s860mNJw5c0Zuv/32ID4Y2nXxAVZlcXFR1tfXj3x6wYbkhIx4fI4dOxatoFb1nNqiXA0gNvGNVjVgPxwO5R3veEfw+te/Pvz5z38uDz744My20mrAXO06ouq4wWAgx48fl4WFBXnve98r9957b6C+Ozs3N8mbahB3Z2dH5ubmok9QnDlz5khcymx9HqdW8G5vb0fPNTVQdfz48SODl0qZex+vH2Jbm4dLS0vR5zDUzhWqzlRpWXYQRg2yqbir3QXUp0geeOCB4Pbbb5cf/OAH4U9+8pNoAoX6HTXApyYyqX9TdeQHP/hBuffeewP17W2RyWQkkek3y9Ug2uLiYrQdfdkBdJWOauD+4OBAHn744fChhx6SY8eOyQsvvCBXX3119P3hu+66Sz784Q/P7ERz4sQJOXHiRJAckA+C6crtCxcuyFNPPRU++uij8qtf/Up2d3ejuk1k+nmFb37zm3Lvvfe+OnGouQHB+O4DKo+94Q1vCN7whjfIL3/5y/Chhx6SJ598MlrRGx+UVJPg4pNH1Db3i4uL8slPflLuuuuuQGQ6ID357IB+F5aaBCYyKYfq8zbqWtSg+vb2dvSpA3VMmbaaah/FJ4+MRiO57rrr5IUXXpT9/f1ocmV8+/0mBojVZBb1/WrVzlTtiSbE6w/1aR6RyTPl2muvDX7v935P3vOe98g//uM/ho8//rjMzc3JyspKNFlIZJLHVbtQrfIPwzC6Fx/+8Ifl/vvvD+JxVivUdai0X1pamtni/ty5c9HfVR44ODiQra2taIX4ZMBdK3jZ39+X48ePy9bWVrS7RRAEcvz48cbuz3S79bnoWaba04PBQN75zncGb3zjG+Xpp58On332Wblw4UJUd6jJkSrvqB261OQk2+0DAACAtgXx7bVmflCyZWijk6kPHVvusLuNo+63eFwKN+2cVb43ZoLp8ItfsI524MyGqZf/yr7gUafYotuBp1s/2d9m2AX2OkLy71/W942mP2v2W06qQ08NVDbRiZWs7+MrWeKrX5KDIqozLV9++u3t7UUDB/HvU6t/Pzg4kLNnz4a/+tWv5OWXX5ZXXnlFzp8/H32z8zWveY2srKxIEARy/fXXy1ve8pZgfn4+9g3VQXRdQRBEHYwq/nNzczPfW1UD4tMBzPR7G39WqgEjNSCiVmmpgRHV6a3uXXxlW9F3o+KrO9UAxsHBQbQaN761cXyXArWCs6gDV33rWJ1Dbac6vb7Z/LW1tSXPPPNM+Nxzz8nm5qZsbm7K9va2XLlyRXZ3d2Vubi7abnhtbU3W1tbktttuC6655pqZnRPU/Y6v3k9XXH+qwSj1LWJ17vg22Wrgo+yK97a/kafK8pNPPhl+6lOfijrE1TeE1eDmAw88EKiBjGSapcc5//mhW351wy9LlTMVjhogND8Borj+V99mTdaPly9flvX1YzOTJNROH2pL3Pl5vfgnVxqrFYlqUsxTTz0VvvTSS/LCCy/IhQsXZGtrK/p+7vr6uszPz8uZM2fk+uuvjyZnqAk4k0GiYKb+iX9/Vq0Sveqqq1J3vJjUb/mTQVX84/Wc+vfhcCibm5uyvr4+U45V3Zy891nfGVS/ryYTDAaDme2X1X1TYVV5/xmNpit2Vf2nnmHxsh3f0vyFF14In3nmGTl//rxcvHgxWmk/Pz8vq6urcuzYMTlz5oycPn1abrvttkBtVRxPI3U98d1OVPrs7e1Fk+zUN4Dzyrmqe+KToj796U+Hzz77rGxsHI8Gzg4ODuTee++Vj33sY0HeCvd4fTw3N7tdqxoce+SRR8L/+3//r6yvr0fPe7VDzOXLl+UTn/iEvOENbwjm52dXVFcVn0ARTyP1b/H/FxF55ZVX5Mknnwyfe+65aPcUtRp5NBrJ8vKynDx5Uk6fPi0bGxty4403ysmTJwM14UI9+2Mx0Ip/2n1TEwXjbcB4G6ZKuzA+2SXZPjl//rysrx+b2Vo7/uwp9xmU/PpzPJ7ch3g7RLVBVf5JpkWdPoF4uzn5zI3n5c3NTfnRj34UPvvssxKGoVy5ckW2t7ejTwQtLi6qz6zIsWPH5PTp03LdddcFx44di+KmJiU284mVafqq+O7u7kZtZtXui7f/VDwm7x96n3lSnyhYXFycKT9q14O0OqBOX0W83a3+f7LDVTAzKVPVryISfUJBDbyLTNsGanV+VvvdtGkaTO9f0cKIJhdOtP2+bK5/Kr3+sNXv2jXF/RPl2v/+3IdpPZEueR1Fz5rq/cf54SdN07/s869M+MlzZp93fOT3fNVU+6uaovxWXbU42f/MmZ5m+g98mkg3c3/Hmjt8MoCOfPoDmFn3q8wWaAygM4DelDKVPHVL2xhAd0FfB9AVNZiW7CjTFf+OerKTOTlIoVY9xbclL74vxekXH3iId2bGtwmNr0BXx4lMBnTV9zvjgwfq2tQAsLqW+DnjkwWSAzgikruCLP6sjA88J39H5Y/4N0lVp3XWFubJOv7y5cuysbEx82/qHGqVtepEV6vc4yvR8sTDUgP6Kk9M0mkQdR6rwXg1eKNWXqrzxP9LSk5MUBMkitsx+fknuZVsUZtNDUYXrTBtq75R4ah8/elPfzr8+c9/Hq3KVZM+NjY25N//+38fddRPV5gVtdX8HkCPD3aoMhQftDF/n6oNoCcnIIkMZnbviHfuT35Hr32g6kv16QJVF8bF62yRad2h0nZnZ0cWFxejb5yLTLZvnuS16eDy2tqaiKSXscluFcOUe3P0+rLynJrkoq4nuV17/Hvf6vfi0vKCqgeTYU4HaMKZZ57anlpESn2iRD3f4ztGqPjGBx3jg0PxsOLxju+2oH6evGfqviSfVyoPqr+r3UlUkFlpHo+niscjjzwSfvazn311MHty39WK3P/wH/5DoK432faJ10fT8MbRPVDbLq+trcnu7q58/etfD//pn/5Jtre3ox0NxuOxLC8vy9VXXy3/5t/8myA+gatuB2haW0adLzmZQ03Cig8qZz3T0p7ryckC8QkydeKv6pJ4/Re/lviEEjWwKSLR6tui+l3d//gzfXYHicHMBAMVB5Wuus+PMJydeBQve5OfT9undQbQ49eSPHfy52nPGFWfJwfe1b9ltR8ODw+jiUo6trd3o890qB1E4vVEPA7xXVqmbWX954tqRybbslkTKKr0UcTrn/SdS46eX8Uh/gyL744QLye2BhAYQG8KA+gmMYCexAB6Wvj+3N9sDKD7iAF0HWzhDqCXykxo6ELDBkA61YGqBjZU+a+6TW6W5AC56ihLrkBXnVVNfPcwLr7NpVp1qAbq1Tao8YEERQ2iqGPj39CNd9Tv7x/OdIirgVN1TYrqJFThTb9BWzyAm1z5E9+GON7RqrbhV/Eos4V5GIaysbERdTSqwRX17V51vSIy01m7u7tbevvW+MrwIAiOpHX8vGqgRt2n5O+qPBTPp8Ph8MhgVFOTQOKTIURkZmVUfIWZiERbNSePsUl1xi8sLMhTTz0V/vznPxeR6WCM6iS/++67ZWNjYyZvxb/t2lXxgR1VV+3s7ERbZbsgPpgY3x5YbUcbH+hU9Uy51ZvFVH2mypiIRFvFq3KQnDCkfkcdv7S0FNUp6ru/x44de3VAcbJlvho8j09AUSsA1be/larfR45v3xuvp1VZTq6yVrt9lHkGqrSPT9JS548PPsa3PFd1VZkBwvjkq/jvqkkL8ZWoh4eH0WQrFVZaGz85cUBtR3xwcCDHjk12NJiusAyivBf/nIAaDCxKn+Sg/sHBgTz66KPRM0XVmc8//7x8+MMfnilzyQlI8fw1HXScXuNwOIy2vF5aWpIHHngg+NnPfhaqzwPs7u7K9va2DAYDee655xp7t4lPbEkOrqqJZ/FvzqtvTC8tLaWmX/w65+bmZGtrS+bm5mRpaWlmUHOSVnodmCq+aRP01IpcdS2DwWDmWZ38PEgatd1/fNBYTfQREZmfX4zaoPF24cHBQSOfEVH1kIprPO9PyqTeDh3x9pkaVFV5O7kzhUrjZN2SLKOqzKmf7+zsRHHf29uLJoE08WyOf25GhR1vg4lIFN8wDGfudxPtG5V2asJjEARRvovvVFRX8tM7aZ/kUZ8/iad//FmXnFQbnxAS38EAAACgD7rdOwQAKeIvpslVHgD6Qa0+UoMI8e10mxiAUR2h8c7QZAexEu8cVx12up2Eq6urMwOcItNBV/VvyZnXqvNSDVCpzsv49yon3z8fRQNW6puV8e+Qq45QNeCjVoeKSOmV/vEObHXO+HfEVWeeClNdT3zL1SJqcCSe3mq7WBX3+IrKw8PDaNC9KI8EQTCzLbDqHFUrMQeD6RbryRVX8c7c5Orz+GBX/JxZqwF1xAct1CotReWl+IBzcnWnTWqSyOHhofzzP/9zFLdjx47J1tZWNDD6rne9K1CDDOpeN1H+Xac6y+PbC6syXG4FpFnx/C8yW18mPymgrkXVLZN7rRe+GtCI7+ywvLwcDQQlBznjAz+qLMY/o6EGgtWg2fz8/Mzq8/iATnLiUHygVF1z0QDY7GpBiY5Tg/TJ1amq3i9bdlV5ig9wqzSJr2qP76gSL19lBojidbL6XrGatKUGclQ84umXfIYnJ6uptBkOhzM7Daj7mRz8Vtej4jzZSj5/C2cVTnzw9IUXXpC1tbVoYsDm5qacOnVK3vjGNwbxZ6VaVa7im5zoO4lHGG1pr8JTv7e8vCyve93r5Ny5c9E29ouLi7K9vR19231hYakw/fPE73HyXqprVs9hVUZVvo5/UiaZZvFrXV1dncn7aiV4kzsFxSd7xNsS8R0vVBzUc6LKBCOVp9SExmncpxM0kmW1iQFUFcf4J0lU22jSdtPbgjz+WZt4uzGt/Zz8FEfWczb5zFleXo4GeZOfWNBtY6h8NP3kx/SzJaouiLeXk2E3NUdwYWEhqjfVhKsmnr3xSYLJ3WUm5XFuZvJcPP+rXU9UHZac9DC5fr38A6C+KruFuEHFN4j9HQD8E7UKXapoq8QlbxutMltsdVX5LXjMbEGRNUApMjvTuHgLlKKQyn0DTXerpqrHF3UKJOOVFfcq4Te17VITZab8Su7poNH02Gbjknaustv1FKWp+Qas61uc+76FDUTyt0rPV34L2VRFQYbhkU2/4j/TfwkLXl1FEUj8WobDGtszpqTf/FCVn3EU1UBiz7X4Fprqz0BkkBKn1CALozQdFE7WZaFKW/XvKdcR7yROdnROOngn8VdbsYfhKLo29bO5ucm3Iufnp78f/3uRZDtOXUe8Uzv+O2ogv+iZmvZvyXPHt3SNd+KrTvUycY+L34tJp6X6eZjaGTsJIsz8+eScg1d/Pkn7yarE2bTVeaYmO6mTK5HU9cQHIIqem/W2yztqPJ4dtFTnnOaHQAaDyQSIn/70STk4GMlwGMji4mT7/DAM5K677pKVlbXY6tyFqPN8NnrNv0uMq9RfKcEHYfEW6HnCUE1Mmfz/pC4cSxiqfzPbyVUUv+TgdNz0no9jA8njV+uiyeB5E6sE1aBNEARHPouQ9txM5v3kpJPZOmYkq6vLperCZL2aNXgeDyu5elBkOuiVrL/SBqOK0m8wqWxmniNzk4SX+eHwyL8FIpN/f/X3i0vUOMqTc3OBzM1Ndi2ZRH0sIqEMBhIb2IlvST37/9PLnebvMBy9Wn9O/h7P/3Hx/BWvY6vWpc8++2woMp14dHi4L4OByO7utpw8edWrg4+HsrAwlNHoQETiK82ng2pBoLbEnj7f49vOq4Ham2++Wb75zW/K8vLyqzvG7EcTEa5cuSInTujtMqHug0qvZLrF/z+ezur/0/J9VpZT/x4E1doPRZLPrLQ8H39/r7oKOT5JQO0QEJ1XRjKIGn4iEo5eLSOD6O+5cS/6eagmjUz/vrR0dOA87d24jLQ2pfr/rAkVWRMEsurRtGPTjq8jno+S+TFe7yTTK+3falHPgmmlMv3/gmNEpLCDLG0yZbwdO6m3E+8gr55+Yf7V9mk4mvn7JH6zx7Vtms/K/V6TYepytU86773I1ThnKd//2Gw4Kb9REH7RJ+qyn0mumI3b0U+CpJsMoBf3v6YcOdMX0FwdlPXcz/t58SdUqoddpa8/jc7zu6njyp5Xf3zl6P3XHyspvmnu1Ivdn+TftJmyo3n7SH0AM3Qaa/GVMgAAACYkV96LTAfU1cvtcDiUr371q+HW1pYsLy/LysqKXLp0SZaWlmQ4HMqdd96Z+h1X+y/HAHymVm3u7e3NbEeutqI+PDyUlZWVaGW12i1GZLqteHyF8uHh4cyK++FwKNvb2yIymaihVtmrnWfUjgki091w1Fbo6vMsKMZ7LQAATWDhTZeUXTAIdIn9PRYL6L60tDUTrS9Iz27JWglWdQZZ1s/IHwAA+MenQYO01XBqu9Uf/ehH0TblahXm3NycXH311XLrrbcGItPtiJPbcgNd5VP59plK5/n5+ZnPEqyursrW1pbMz8/LwcHBzGdHrly5Iuvr6yIi0RbMaivleAflyspKtK35aDSS5eXlaCvt5557LvrMx+HhoSwvL0db6qvV6siWtfsNAAA+828LeLgkb/eEvJ8DXeD8AHrTGNSrj8qwu+pv4Tyr7TxCngQAQ6hfocH081mtxExu568GmobDofzTP/1TON0y+VDG47Gsrq7K3t6evOUtbxGRyZbHi4uLMjc3F32rtwvfQHe9feR6/Hznffo6Hv/CLe4HAzk8PJSlpSUZjUZyzTXXBPv7+6Gqaw4PD2V/f18Gg4H88Ic/DN/5zncG29vbsrKyIuvr61FdFv++dPxdTX23eTwey9LS5Hvm29vbsri4KIPBQH7xi19E30BWx+7u7sqNN95oPG26our2qkBbvK/f0Wu2B3C7Xn66fn2wK22hHW0k9IX/PUQAAAAAekOtKk/+/9zcnAyHQzk4OJDvfe97M99dVd+kPn78uNx+++2ByGT74+n3hbsxeA7Avvi27MePH4++gz0ajWQ0GsmxY8dkd3dXHnnkEdnf35eVlRU5ODiYmeyvtm1X1PHz8/NyeHgY1Vdq8H1ubk4efvjh8OLFi9F3kNVA++Hhobz5zW+mcx0AAAAAKuhdLxGzY+oj7bqrqc4UtbVgW3klHl7afwAAoHviz3g1yBQfCP/JT34Svvzyy9H27Gpb9/39fXnXu94VDUANh8Mj37llgAmALvU5iLm5ORmNRvKGN7xBRqORHBwcRLtiDIdD2dnZkW984xvhzs6OzM/Py97eXnSc+ka62v59bm5OBoNBtMtGEAQzW8A/8cQT4de+9jUJw3Cm3js4OJATJ07I6173uiA5+QjpeJ8EuknVi1n/wSzb/Xe2wwd8llZOqDfRF85v4a7zDeYyx6Ma0rNbir5hUiTv4UleAQDAT7rtb9OS31pTg1Xj8Vj29vbke9/7nszPz0fbFx8eHsrh4aFcd911ctdddwVqYF1kst3y/v5+dA4+94Suc718d8HCwkI0SD4ej+Vtb3ubPPXUU3LlyhXZ3d2Vw8NDOX78uOzt7clXvvIV2dzcDB944IHgxIkTsru7K0tLSzPfQI9TA+dBEMj8/LyIiDzyyCPh1772Ndnc3Ix21jg8PIxWod91111y4sSJI+fCUcnyQWcxAKALeL+BjqxvndMuQh84P4AOoF06jaqsByoAAEDTgiCQ4XD6OrOzsyMXLlwIn3322WhV5u7ubvQ7d9xxR7RyMwgC2dnZkeXlZVlcXBSRyWr2ubk52jEAtKnV5wsLC3L99dcHp06dCnd3d6N/Pzg4kEuXLslrXvMaefTRR+Wxxx4L3/jGN8q73vUuOXXqVLC8vHzkvezw8FDm5+dlOBzK/v6+fOc73wm///3vy+bmphwcHMjKysrMzhvz8/OysrIid955ZzQgT/1WDgMNAAAAs4IgSN29jXYTuiwYjUZ6J9AsILrHswJdl5lZ6OUr0PJfEUg/5/jIz+O4//Cb7lc2dMt3Ufimz1/Edvh+K9uBml2PNvT8qNmR22T3b9rkn0rPj7LXED9nneuOHa/bAV7r6dhg+DYEnse/Cabb3SbNxn0wswW7iETbFv/lX/5lePbsWdnZ2ZHFxcVoxWUYhvLnf/7nQRAEsrCwYCBOxaK4Bnr1Z2A5+7r+/tZkPq0zObRu/Jv8pJKOwvszG5g6SCvMSgyvoM96Vqi/q90r8qhV5HFPP/10+LnPfU4uXboUfaNcfZ98OBzK3Nyc7O/vy/z8vBw7dkw2NjZkcXExmuRzeHgom5ubsrW1JZubm3LlyhXZ39+XwWAwc64gCGR9fV3Onz8vp06dkj/4gz+Q6667LlDfSo+rk1a+P0ub7B+olX51AjKQ5rbrqSps57kmw6+U6in1a9nQM++vxjtLGIaV6t+mytps+rfX/6xzr13rh5z2pfpXZ2OqTPtZd5dRm2yN75Qdv+h6+sN17vRf+9j+18UKdHRG3sMKADCLLVwB+Co+OKW+KTwYDOSJJ54Iz549K3t7e7K4uBit/tza2pJf+7Vfi7Y2pn4DUCRZT1Tp/Ix/EmJ/f18WFxflpptuCn7nd34n/MxnPiPb29syGo2igfPxeByFt7e3J+fOnZNXXnklWk2uJv0cHh5Gdd78/Hw0SUhNIFpaWpLd3V155ZVX5PTp0/L+979frrvuukBEZGVlJRqsBwAAfmEQ1i7SH+gv49MX1BaJWf8BTSJ/AQAAmGW7fZ9c2anC/NGPfiSDwUDm5+dlfn5ewjCUvb09WVpakrvvvlv29/dlf3/fePwAmBOGYe5/TZ0/qUr9plapJz8zcdNNNwX/9t/+2+C2226LBr7Vduz7+/uytLQU/b46Vg2wq50DV1ZWZDgcyuHhoezt7cnBwYGMRqPod1ZXV+WGG26Qj3zkI3LHHXcE8V04yqyeBwAAAABMMP0YAAAAgDcODg6ileRqZeaLL74oTzzxRLR1+9bWloiIjMdjueuuu+Taa68N1LEwixX+8FnaVp5Vt/2ND1Sr1eiq3jp16pT81m/9VnDzzTeHP/zhD+W5556T5eVlmZ+fl62trejTFEEQyPz8vIiI7O/vRwPo6jvm6pvm8c8MjEYjueOOO+TXf/3Xg7W1tejfd3Z2ZHl5mbIJoNOa2IIZAAAgjgF0AAAAAN6Yn5+fWZG5ubkpjz/+eDg3Nxf9TH3rfG1tTW655RYZj8fRt4IBwBQ1ADMajaLPSIjITN1z7Ngxuf/++4P7779ffvGLX4T//M//LE8//bTs7OzIwsKC7O7uysHBQVRviUx23lhYWJDz58/L6uqqLC4uyt7enoxGIzlz5ozcc889cttttwWrq6tRmFeuXJH19XVZXl6Wc+fOycmTJ1tODQAAAADwV6A6nmqfoGCGnukZgMwg1DU2cta0mfvpym8jl35OM/EH3KC7zaJu+SgK3/T5i9gOv9uK6/GG6t+aq6GaXEMVX72V/LdykSkZm/g561x37HjdVWS1WkcNhm9D4Hn8m6DbLi7bvjORvrNhHq2/Nzc3ZW1tbeYbvzs7OzI/Px/9/8HBgQwGg8a2Ma6anipdwkCv/gwsZ1/T97+pfNqEtOdD2WOqaireptNv5uwqrBbrVN2Q6ubfsukaH/Te39+Xubm51Ik7agv2ubm56LMUFy9elKeffjrc3t6Wzc1N2dnZkd3dXdnd3Y2+h37mzBnZ3t4WEZEzZ87I6173OnnNa14TBEEgBwcH0ar1ra0tWV1dFRGJ/j3+87xrzeP7s7TJ/qFa6VcnIANpbrueqsJ2nmsy/EqpnlK/lg098/5qvLOEYTj776mnr/kulRuVePq31/+sc69d64eett/9q7NRjW4bxiZb4zvlxy/KnyvJh/SH69zpv/ax/a/L+Ar0PiYq7EnmNx5SAAAAzbLdvt/b25PFxcUoLkEQRANQg8EgGkRfXl6OjlHbG6tvowPwU1sTOJLnqTOBaGFhQcbjcbQrhjp2f39f5ufnowHu3d1dWVxclOPHj8tdd90VBZA22UfVeWnUIPne3p6oLdx3d3ej+pF3YwAAAAAojy3c0Rl0hgJAedSZAHylBs/H48lK7iAIZDgcymg0krm5ORkMBtEqULUKMwiC6DgAdoUyWYlZ9882BEEw01YqO4A+NzcXrRZXg+bxQe/RaCTD4TD69/F4HA1wxwe71c/iA+/x1e3qd5IrPufn52V+fl4ODw9lbm5OFhcXjxwHoJ9UbVGlnrVR/wI4ih147SL9gf4yvoW7aaa3YDPPzS3IdVdylx2YydoiKa+DokxcmlqJnnYdWefKu+Y2PkWgu+2MTvzrnHMivyPH/NZy+eXP+hZ/muEnO93icQnDUAaDoVYdGYYjrXg2uVVSnXDT8p87z4byytzDtgbLTdSP2ablt6+TAQp2McwUhPodYP1M8ebUKZ9t1E++lKW6ed8VQZjf/tHd4r04fKOnR0Vl3lua3cJW7/2/CWEwyYdV/2wqbJt0r8P3+Jtge4tvn+jmHxfvfxV9v36R+vVvU2mXe5rC9pFeHGyo1n6v1/5rq/+2rU/w+dR/mvb8qZv+xdetWwCK079Of07RsWXl7bAzCd9s/ituSzQffrX0Lh9++m5K7YWfrnz4Lskr63W0/anqafyPfk6qznl8pdt+YxoySknObtf9vSI6jRjfCzUAAEV03p997HwCgK7yofOoSeoZVOdPnl8AUJ9O/dtE2FThAADAN2zhjlzJGWBVBqfzZo+VUWeluW74DL7Xw7fn7Sg7My1eFmyt+gYAAEC65HbhAAAA6I/idiB9eABgg/cD6HQ0mJf8rlrZ36167ibonI+8VE9auulOnkDzyN8AAAD2pW+ryORGAAAAAABcwhbuAAAAAAC0iAFzAAAAAADc5f0K9KZXROOoKp07dbd7b+ocuseSX6pLSzc6BN2Ql6e5RwAAAM2r8+5U5R2ENly+wv4Bcft9z/f4wyz6vwAAcE/x87mliABonPcD6DAr+QCo8sJW9hvmTX4nvWr4Vc6HbHTk2VEm3dUgevzb59wvAAAAdzCRFwAAoL8YgAUAN7GFO0opO+hWZ3Cuyc4iBgcBAAAAAAAAAAAA1NWbFegMqqYrO3hdZhvoOgPhafel6QH1to5PSwvdLdbqhl/2/HXO6YM622Emj9Whk+5Nhq/Olb2zwtF46ua5Kmzlr2m4fubvpKz769JKNl/rEsCUMIyXiezykV12xjXDdade6LIgdk/ZbrkfmviMVZ7Zc5ptv3W9nnC9fBamv+UmVdEnomzknzbDNF3Wi8IsWgOTVbynca3XfrCp2TSvvoYomCl0I83w4TIb5bsJpvtlXEuLJvoWTKZZ1Z1W8/ov68azbJ9o2fO30Z+TF8bkZ+2Vz/T+9fxj6sQp63OoRbvjFt1fM2MBftaPuso8F6q0f4s+gdt0WWvqfDrjLF3ACnQAAAAAAAAAAAAAMIiFRv7ozQp0AAAAAAD6rOsrB4pXcNNZBQAAzDA1KObbTgGYxf1DHIPnfmEAHbko0ACAOpr8RAUAAAAAAICL6N8AUAZ1hX8YQAcAAAAAAAAAAACABjFw7i8G0NFrrJAEAAAAAACASWzhC5vo/7RDpTvpC/QX5d9vDKADAAAAANADXR/AKby+luIBAAD6rck2le/ts77j/gH+GtiOAAAAANoVynQQoe6fAAAAAPolCKv/GYS8QwAAAP8Eh4eHmbO0gyBoZYuXrHOUmZ1TdwZ9W1snFKdf8TXmX0P6HIjkMdnXOy4Mv47y4ecfX3xcueuvGhfdLXam4Y+1zlNsev3xa1bhFV9H+v2vc/26aV4nHmEYJP4/me/a2yqpuTxzVN06smz9WDfO4/Fs/kmep275LYutsOpJqyvSfqfO87VOnVH//pV7fmWVk7EER8IPZPr30HAXTxDqPX/DoJk5kEEoEgavdnAFkxQIRUTCMPr35J8Tuu0Hu3M4Q81qYyDVy0eT4Ztqv7Wn+v2Pl0/d5KtSuk3XBbDBdvlpr/4LUkqLdvnRXEGT9fxvq12n6t+0tCl1vIyiv6tzNFFPTONTlD+m+ddG/VSi+6KAXv6P95/UyYtl20/Z/Rl69UcQDhLnm4aV1f5O+93a4WuWr7Fmniubf3T6CMuet+y5mkx/Kdwho+D9vsL7Q7JPSKQ4/5e+PynvB2X+rFN+ZvOCbv+nm8o///L775S6/a9NqdLnauL4rHPVOWbWILd/Pq9PdkIv/9e5T7PH65aL/Pib2OEoq62Y9nvF5+/mGtI67ZOmynydsqpbP5kbXzJ7fJayeVzlX1vPt77voNDN2gNAL/n2otQlpD1clZc3ybfTgYToz6x/j/2pP/gLAAAAwCdqJbn6e50/AQAAfOL9N9D7PgMC8JmJ8ltu5mF+PBhUq4b06qamVpi5IK1eIN/mq7syDwDgBpfr8axVtm22HUIJnU4jAACAthSvIG8pIgDgGO8H0AH0V/q2SPGGX71PJJTZvhrZDWzSDi4q0zHPVs0oy6UJIgAQ5/qg8MynU0p/dsoM9dxv8xMugE36W5A3Ew9f6W5RTP0CAADgFwbQAXiv7RUryMbgOVyWNekGAAC0KzmQbvPZzGp0wA+6nxGilANAOvpIACAdA+iGFQ8m8YACmlB3YMznrZ1diqdLcQGKTPIrq826rHCFEPccQM9E9Z7uAlTNFZi2Za1257kAQBftTwAAgG7xfgDd9xd4oM9MlN86K1gY/NVD+nWTbvn0+fnMZxyKO/j6nToA4BfXBm2c+AY6z3oAAAAAQA7vB9ABAACa4vLAPgAAaA6D6AAAAGUWQLQUEQBwTHB4eJj/CwUVqOkXTtMr4Owbax4/sBy+bbrXb5rp9OX+5/P9+rrO9fILt+mV7zCW/+yszMuPf9G3WEPra8Btt1+aF29Tdr/9aFv1+z9TJjTb/+PCHRb4xEO32S4/7tV/Pil+Ppous83nn9k6p6D/JXZ9Jq61+/VfufKX/Ymv4vZbVrpNfuZ6+8Ksgeb1Fz2/ddmvX4qYbX8HBZdX9PMiYVA9/vE2XRja7Z+2z2z7RXcieffTv3z7LT0tj96/KmlmegfAvt6/tE/71N0NVef4usq2T7Kwg6sv7L4/9n2hESvQAQAAAAAAAA3xAdZkp/zkZ3Q8AwCq0x24ZOATAOphAB0AAACAN3zvAGIFCIAsRStgxfoKWJQRr+f5VECzdNbgsv8HAAAAquj8ADovKwAAwDfFW0TStgGyFG4xRvEBvGV/C2UgW3LgXGQyKWr6dyvRcobOFqAFu3c3gvoFAAAAcYUD6F1YIZH2PQsAAAAAAAAAAAAAAOKcX4He5EfqWY0OAAAAAACApkXfO0/0PdEPBRcULpBiix4AAIAZzg+gN41BdAAAAMBfTU6wtYF3EQBZiraQpvbww+y27dw1AAAAwEcD2xGwwfdONwAAAAB2BWE//wQApIuv4A2CYHYVOtMf4Ii05zvPeMBtYRjm/mf6eADoq2A0GumdwNPZtL7Eu+6s5fLHjetEy3nJh392OujOIUlPv7T0z7snhVtplbj/Tc5wL59+zYaTxVz45cqHq/WFbr6xfbwqf/Xzbr36axrvQc1wuyXrPpa9/zrpVzfsybGjWuE39XJYWH2kiHecFq0wKy5fc9UjMEP3+e/7HEzb12+7/WU7/nbzTxA2E/8gnNQFrf8pYwllshLVxp/uK8hfQZhZBwcSFNbPtsWfD/1sw9iuv2ybbT8rTeaFrDbIZDc/3/Of7fyjF/64IPyi+mugBky9vHfmFdevuvdPL/yBZv6LBszl6PO9TPihpfZb1X6J7ubv5p5fun1xVd/jk7vB5oVfpf+zSNkwq4Rftx+sTj9Ek/E33f+Xdq7ZY3zvP9B1tPzq5vU6YwVlym6TffVNx78q18I3389uSvr7h44m60rTereFOwDAHfEHI5/YAAD4IL5Ky8oq8GDa2W3jT/deaauJDzAd6VTy/uoAAEgXpPydt28A6D4XByUBXzCADsBb7s7MKsf3+OtS1x/vvGYQ3R22G9i2wzdBDcyU2cKTcgAAZjGJDwAAAEDXpa2k5t0HKKfv+2cAACxKdl4n/w3wVd73xFjhCAD2xOvmrL8DAAAAQJc0+flXoC8YQAcAADCIARkAAAAAAAAA8AdbuAPorOJBK2bc2aa2bVd/j/8JmNT2JxTYHhhoTt8/gWKb6+lfGL9BEP0e2xi6pzh/tRQRAAAAoEPU+w79U0B5DKAD8FbRw971VZ99b6ykffO872niEtvlqzh8o8EbUWW7LAYQAMCstEl8AOCyoi0kfWwf90nh/Yv9nacSAKApae868T4n3oWAbGzhDgCwhsFzdFXet3Rdn9wDAF0WyGzbY6YtwpAFAAAAgA5JvvMAKG9mBXrZDl0KXHvqpjX3aMJWOsTDTZar+EqXJrfAbPJa20q3tHQydR316je3y1GVtDIxYNfUvWq7nE7Dc/v+tsXmc0bnHCbiHS8nRbNxg4IiFf08axCdKYxAbYOi+ruofBbUH+PxuPTv9oVPE38KdzCRcc7Piq/TpS3s0+JiO8+aTh/fz68ffjvx8FUfd/CpUj/bzje2y1eRvofvOtfzj0vS3mVN9T+W6eNso/8z7fwm8kzWMSqs+C6LddrPRXEqE74JVXYorNP/2lS842mv7kUy/6XdH924FN3ztD7v+KKLwSC9gyh53qp5Nvn7ZY4vmxZlVrDr1stdOb6ofPbxk6ZV6mfbfRFs4Q4AAACgN2y/gAEAAAAAAMBtDKADAAA0rHgFJGxiBQsAAEjq4wp2AIB5VVZwo5tSdzYssTsDALsYQAeAnmKACHkYYDSL9APsoZNCT9/rL9vXbzv8Iua3SjR7/bbT13b4vut7+rl+/a7HDwAAE+LPP91t2W3wIY4uI/38xgA6AAAAAAAA4LAgbf5X7N+KumdD+m+tSr1/FXD/AMBvyYF0JnYD7mMAHQAAOEd3C01eRAAAAAAAANzGFvfQwQ6aMIkBdAAAgIbxDXS38QIFAACSitsHtOAAANUxAAy+gQ74aWA7AgAAAL4K6v4Z2v0T3WAj/7jwn3a6BUHuf+g2V+rPvoevy9f4N1UH+nr9XUH612P7+e873fYbSQgAAFDNzAp0XzuMsuLdhRk86hrM3RvdORTjRmJRX3r8p8lVFL/0n+umezLvZZ1H/77avn/T8PPKW5nrrJcU5eOfHoeiQLszxyg9fevd/+m9zk8f88+U7twfF5W9f7rP2rr1Y3Gw1fNflSwbqPITvnpc1T/VsbX/HOsdH8xVTJ1ZXWhj2dXM89tK/hERCe3Wv3W+ARqvU5LZt2y7TSf8Zplt/4VhGKVB/M+09nG9ukAv/tqDKKoulnp/NtX+sD0AZzt8XfXjb7f+aiod49cVhq+OjL2at/P+DEpEILOKCxI/tZInbL9/BNM/wrBG/aHr6PVXar9aLse2w/ffoPZEmrBk+RfJeT/LqB1MvhckvxfcRSb6fbNWuuaFbyrc5M+aCE+3/7FuHLKOS4ZZ5/xl7/94PNuOT7bZy4jHr2z+q3JNaecKw6PvH/FT6u4AE8Q7WWTybAyih28o8ePTLyVe16SEXnj96j7k/zz1JznXngy3bB4sOk+ZY9KOr1pPVX3PrhuuqfrN/LhcWxp6f21xxwSX+hwZfQAAAKgj1Puz9ur1hv6EvwIh3zTJ/xdiVGWzHNheRWw7fF2+x78Jfb9+V/AcRduo/9AFtLvtShvQbOqesJsXgC7iG+gAAAB18G4IdAbfnwMAAF1GOweu8LXdnRbvtgeMs3aFKlJ35XKVeFUNG83JyhOkPaCPAXQAAICe4UUKfZa1hSQrJgDAb6bbNzwmAKAZXRhEb/PdIS/cKtvWt/lZBB/vbxbdLe7byivxT3F1Kf0Bm9jCHQAAAEDvMGAOAAAA2OHrlt+24l3l2/YAgGawAh0AAABALzFDHwAAALCHQWDz0tI4vlq5zvFlj3HhPct0HnMlDyd3GHAh7QHfMYAOAAAAoNfoYPBH6Eb/FAAArdJ9/uluQQzAvrpbyGcNZje1HX3eYDzvWeblpb0I9Tuggy3cAQAAAAAAAAAAOio50BqGYWODq02eCwBc4f0K9LwZUnVnZbnE13j7Tjfd+3jf+njNfTWdwTj7/+intBewOsfphGvjJU03RNdLTTJNKeeI69IK4C528hSvMMs/fjBIn2OdXMGQ9f1HX9I0K518iT/8pL2CNCV7xvPyeDwuiEB6/lb5fjAYZLYBWEGGOmba7NotaJiku0Ld9vuZr2y/Z/nY/+lynPPOnVUuqsanyetvKi2KzmP6nuWtgK+yVX3e+fPUOX/8nLoryE3ET+c4k8dXGeuzXb92Rd+f6d4PoAMAAMAcXjoAAPBD4TM7SO8E41kPAACQznY7iU9wAPZ4P4BOBQEAAGCG7RdFwAbdFdyuo1wD3VVYf0lYejUTAAAAzGBnH8AP3g+gAwAAoFm6W4gBAAC30XELAABgDxObAfcxgA4AAIBCvNwB3WDqG3lt0f2GtO75075BDbiicEA8kb8ZRAf8ofv8c/vpDgAA4B4G0AGLfO/ABAB0H88iAAC6IW3AnOc8AJEyO0xRVwC26PYf+97/rDvZz3T6lVU3nW1fv+t008f364dZ3g+gt1XBAQAA9A0vEugjOpAB+Kr4uc030AEAAKpoagA6DMNafSxdHwAHXOb9ADoAAAAAoBw6WIAOKzGADgAAAAAoFhweHmZ2opT5HpbpDpi8OJQJWx3rbkfROPenttO/2EDz+PTrz7vuNq5Zd1u7tHxXlBftXHP6/StfbvLzb5Gw4CNe+tddPn5p6d/mFkg26ir99Ne9/7rXrFv/oCtMrKBKq79NMFXm3W8/mFH2Xrl+/VWeSS5es0vt76K0bGsFpgtp0XUu5TscZfv9rikurtpudzvQo+3/auHbab+zbb3bqL/b4WL9VaRbeaJc/2cT11ylTDXV/6l7fFPPsjrXXPX4vHOaemcrc7yJY8ueo+j48Xh85Pfq9JmWCb9OXWdjh+Nq96v58Zc2yoqJfqk2t9O33T6ZXuvAkXj0E6MPAAAAAAAAAAAAaFy3JsQA6Au2cAcAAM7p6wpqxffr141/168fAAAUY+V4v/je/gMApEvW39TnAHzBADoA1ESDD4CrqJ9gEhME9DBAAADFeNYAANANvN8A8BUD6AAAAECLbHxjDQAAAAAAAEA5DKADAACgU5jhbhYTAPSQPwGgWBAEPE8AABD771+2319shw+gvxhABwAAzun7C5Lv168b/75fPwAA4HnaN9xvAAAAuIQBdAAAAKBFrKgDAAAAAAAA3BWMRqPof7I687JmgdqaHdqtWalj2xHQNNA6OgxHuT/v1r2eKttxbv769e6ffv7VDb+I7+XLjGn+m6R//XxmO31N5x/4oq3ByHhZaSrMrj3nVLrYuq62wi+6/3XDrxP/vLh0LX/pslFXuMh2OUU3pZUvlcfyftZlZa+7Tt3UdPqVj8NYM3za75ig/dI+3X6oMsfrHFvlfH6y3X8Cpc22sI26ro/1qzv97GbiMh6nH1M+Lx+tf8qEr9M/YTp/1+mf8zf/220/+7gApMn+W1agAwAAAAAAWJA30QAAAAD9ptqK/g4AA/5iAB2wiAcfAACAW4raZwxyAagrDMPcHf6oXwAAAJCU1n6k7QiYxwA6es3UFqwAAAAAACTxGQUAQNvo/4TPGCROn4RJugDmMYAOWEQDFgAAwC10RAAAAAAAXKAGz9PeU/N2NwKgjwF09BoPGAAAAABAW3gHBeAjPnHjN549gN9YgQ7YwQA6AAAAAACAYXkDGHSCAgAAICneflR/Z+U50A4G0AGLeNABAAC4hRVWANpEnQIAAIA8yXfU+EA6AHOCw8PDzE6irG8rJH+n8UjFztlE+FnnYPCyCWPL4Q8KfyP//qfHXx1TN4/oHl9e8fX3W3H+1KsffE9/vfIbhvlpRB2LPrPRfspS55mkG3/b158MP/n/ReHntYGrtD27Vg/qvJy3kRZdTfey2rp+2+Ubbiqb/5p6z0rSzXdV67cm8nlTHZ5NpqXtCUR12ypV81Xb9ZTt51PVdhAAE3T7T3X7n8z2fyp1nyNNtwvyzp93TFY8mmz/2gjf9eOLzuNS+8OG+PXXiavtdoj7iurXdsa/suvHOc0zN/P86etkDVagAwAAwCt1Bjr62tgHAKDreM4DgB+6Wl8zwRSArq7Wj75jAB1Ar6U9nGjYAkD38DICAOb1pZ7lu5Nm6AxAcD8AwA+8lwH10NbpPupH9zCADqD34g8nGiPlkVZANt/Lh278bV9/1vfA1L/bjh/gM8oPMMH7Q/voUASAbvBtkMinT5y4eDz0kP794lv92HUMoAOA0BgBAJ9U+cYpLx4A0B7bHcw2sBq9OX3MPwDQV1mTnn1EOwBAk7pUP/qOAXQAAAB0Fi8eAICmZK06ZzW6PVXSnLYAALiHZ2f3MUHODNqf3ce9tY8BdAAAAHQeq9EBAE1h1bkdpDsAwEVF75k8u9A0+jaAdjCADgAAAAAAtPWpM4/B3OaVyT+kOwAAAIA2BKPRKPcX8l5OTL208DLkk7Hl8AelfzN9WxPb8ddV/vr7yfT99T39ddPH9+sHAFRRdWCMNj0A39haQaYz8aDJOFW5/vjvlt1ClOcCgP6y3f/ie/+n2+o8P3kmmpF3L0hzpCuqX23Xn3br/zB0p9zY+EQjox8AAAAAAACohQ5pAAAAAF0z7NMWawAAAAAAAGgWg+gAgL4q+wxM7t7CsxMA3Ob8N9BtbaEGAAAAAACACdcXYNB/BABIw/MBAFAHW7gDAAAAAAAAAAAYkDaI7/rENADoO+dXoBdhBhl09D3/9P36bSP9AQA+Kno+0REEwFe2298+1q+20yzOpbgAAJrje/9Zcut2kWmcy2zlbvr5rxu+6fR3PXxdrudfoM+GtitoAAAAAAAAuI3vtQIAcFTZ8RO+gQ4AfmELdwAAAAAAABRikQUAAACAPghGo5HeCTydKWU73tOXznFmXLJeTGd/X3cOxLhU2NnpZTb84vtUPnydF/3seKTH34asNItfd9W8VnSc7v03vwVP/v3RDz/9+pvqVCreISS//ja9BZP+8ek/L3/fbZc/M/Vfe5hDZ0P552vzYdpu+wBwS7l3DffY3sIR6APKGQDUl/7+NT7y8zRV61fd98umji97XNX2Z9p253ny4pEXdtnrqN/fl9//EgT559XvZyzq/9Edn8jXZLvCxES+ePhtTRQsc81N1RW22nW68W+q/ywtHn61Zd3ov61bNnzfAd2N1AcAQHxrwAAA4C+euQCyUD8AAEzg+QLAhiAIZv4DymIAHQDgBBowAAC0i2cvgCzUDwAAE3i+AGgTdQ50DG1HAEB/8QCDQl4AAMCO+LaVABBH/QAAMIHnS7/Q52cX6Q/UxwA6AMAaGnEAANhX9ruSAPqH+gEAYALPFwBtaOpb6ugnBtAB9JbvD0zb8dcN33b8AQDALB+ezT7EEegiVgsCAEygbVesKI14PgPlqfJC3YMyGEAHAAAAAAAAAAAA0EkMmqMqBtABAAAAAAAAAAAAdAaD5tARjEYjvRNYyoBZ30lJ/v9gMGgtTvWMc39avKWE7vXlh1/Mj/CztrKJp2vedjfZ6a8bfzvi+apM2mTzu3zpy7/+8XgSfjItVZrr109+5r8p36+/7/EHAKB9bLkHAABcltZWCcNy/e+m2jddbT+Vva6iLc5106V4C/X8/pcg0NuC3Xb4tpTdur7u/U07f9qYlP74Qn74XSu3qMqd/lvdz0WklZ+0fF62TDUpq5y5k/oNoUIBAAAAAAAAAAAAAHe5PKbbyS3c46tqTc8wA4A8aXWMqqOonwAAAAC4JvmewnsJAAAAgKa58p4RhmFqXLwfQM/ayt2VhAfQX2lbj7D9DgAAAHyV1bGA7kib5Mt9BwAAvmIBE+CXtrZtzwo3Xid0Zgt3KjoArsr6hgcAAADgmzI7KQEAAAAA4Jv4u673K9DjslajAwAAAACA5rAquZvin8SL/xsAoL6ietT1vmxW8Nqlm/6OZy8APRavv2w8C7N2C1b/3qkBdCX+wscDHIBNed9Ap34CAACAz2jTdhP3FAAAAIBNbb5rZoXVmS3cAQAAAABAu1xfNQcAAAAA8IfN1ehxwWg00jqpjZnJ3ZoNPdY8XncOhO3wdRXHP6uwpW1NlyU7z6Vfvz9b3jVz/+1t5aQbf11F+d92/IrYLr+6fK+/6mGHFTTDdv3kZ/kD3NDP55+L/Hwm5+efvFn+Zd6d3E8L8n8fNVdW69W/dfod8o4pcx3pxw9KH9+kaVzGueGb6leY3v+5Wsc3x/bz23b4unx/fzETf93+x7T6sUqdWTX8vD7aOsrGtcn6pc4zRX8Ldr+P15UMv+l+dxvpp5t/3G9zu/SuVK/+nsbf9mRh28/fqTqD2rr3X3cgXff2uZP6ALxl/0EIAAAAAAAAwFX0H6IJ5CMAbWEAHUAjaLwAAAAAAAAAyEL/IZpAPgLQhqHtCAA26W7RgllVtsUHAAAAgCpsbyEKwBzKL9Afbfcf2q5ffA/flfj788lUAF3BCnQAjQqCgAYMAAAAAAAAgFT0H6Iq8guAtrECHYARrEYHAAAAusV2x6Xt8AEd5F8AOIq6sRhpNJW1Gh0ATGAFOgAAAAAAAAAAAJzHpAIAbWAAHQAAAAAAAAAAAAAAYQt39IDOjLS6xzILboJ0AJpHuQIAwA1dfCbnXVMXrxf9YDvvlg0/bTvaKnFXx2d/V9hOOkzjYjt8oHt083fa8VXOabt82Qjf9jVjqq3t3E2UszaPt8XXeCvT+PO5AB3x9qmPWIEOAAAAAAAAAAAAAIAwgA4AAAAAAAAAAAAAgIgwgA4AAAAAAAAAAAAAgIgwgA4AAAAAAAAAAAAAgIiIDG1HADApDEOt44MgaCgmbipKH9PXbzp81++/7vXbPh4AshTXL7rHUz8BdVG+9Nhuf3H/9JB+bnP9/VCE/JPH9/af+fq5cpSAiO3yUcR0/5vt67fdfuN43ee3HtPhu57/u47nN/KwAh0AAAAAAAAAAAAAAGEAHQAAAAAAAAAAAAAAEREJRqOR3gkM7GEQP2faFgrNhjnWPL7vcxB00y+fuv9N3PP07TjK3b/s8POvvzj+uvmnXPhZgmCu5O/lX3/d4/W3oMlPP/NbuBenf91rL4pD3rnLh380/aqUtTDMf37o3r9itutv2+HrMlt/F/M9/W2nXzvy6iqd+q1aXdNcW2DKdvnTRf7X0+/7r9sGKXvequ3f8sebpte+FtGrH4vOUfZ85trf+XGxdd/Khj8ej4/8XrL/oUzaNX2dZePvSjonNbX1at3z1EmPorRssrw2Vb9VjfPRcOc0wx+VOr6p/oHk/w8G9Z7fZdO/iXf0Ose1x3b7R7f/LF/d4+s8S00qU8/p5FXduq1+P1v1/Dcbvl7/Y5aq999U/6fu8XXer+uep2xc4r+XVj7bLF+2t4CvIi398n7PZXXyfZPvqq6koX773fbze6qpslTnntviTuoD8JYPD20AQHXU7wCArmlqcrbrnT2A7+043+MPuEi3XFEuUUcQBEfyDu0oAD4Y2o4AAHPabNgGQUDjBwA6iPodANAVuu9HyRXq7uycAKTzvR3ne/wBF+mWK8olqspaVW17Z52mNLUTDwD3MIAOoDE0ovvF9wYugPKo34HuoIMHmFU1z5vcyh3QkTVA4Us+9T3+gE8YRIcNyXzTlQH0PivziVHAZ2zhDqBRadvyAAD8R/0O+IdtpgGgf3xvr/kef8AXuu93vB8C/cV7JvqCFegAjGA2KgB0E/U74Ifk6g46OJuhu4KfHQDsytt+vc45AFdlreb2he/xB3zCanT3daXtwQ4j3UB5R58wgA50WHEHXksRAQAAQGvS2oAMogP5ypSR5M8pU3Cd7wNbvscfAJDdP92VdlSfnlN9ulZAhAF0AAAAAADQY1U7A7vS4QsAAGBa2rfOaUv5h8Fz9FEwGo30TmChsms2zLHm8X3/jLxu+pmVrNiPbhUzV+o82XnOdv7JD7/4wZYffnFZs33/8+Ov+2A3df3ubFlkNv8RvunwdbldfovZTn/b6eemtBdjN9kuf7rI/3rKtR/czcfdTn/73EtflSfVCumsvBlvY9rKv3mruNkFwX9V6se0dzHX7/94PCn/Oh38bq+yc/v5b+r5mzyv7qc2/GX7+etn/nGdK9et2/+oZLch8scv2rz+Os/Cvg4gu9P/WU9bA8a+pYtJeWne33Sy/fxOV6V85L0fFtWPtiduuJn6gCH9rWgBAAAA+Ix3GcA8yln3cY/RBfFBB/iBugcA0rlcPzKAjt5xuUACAAAAAID20VfQH9xr+EYNmKcNnDOQ7j7qHABI53r9yDfQYZXprbOytuhyvWACTSguXy1FBAAAABD997/+br3cDy7eXxc+jQAzgiBg4BHeqpp3Xaxfq3A9fnXwfAHQB3n1W1ZbzKX2GSvQ0Qs0RAAAAAD4SH33nHcaAGgWdSsAAACysAIdVrX5opK2Gl13hYPritO32y+KpvOX6zN4bYcPAPCT7R1MXH++Ajps52/TK8B12T5/3+sX399/dcXvv49pwfO7PlajwzdV6yuXy18f6D5ffK5fm+D69dtuP7vO9fuH9qi8EL/nuvWj6fLHCnT0DpUyAAAAAAAoq++d3wDsiu9Gk+zXpJ/TbzxfACCdC/UjA+gAAAAAADjAhU4CALMolwBcw+cHuoHnCwCkc6V+DEajkd4JLDysaSCgOWMjZ03bjiKd7hwW3fibnkNTPn7l0yyuKP7F4WdVxv2oZ5hDBZ+5Xv/BLO6/nvz0s73FWt3w67Ul6hzf9/zTd9PyUyfPmS9f+fkzDMu9/5sq5212hKR9wqvsMV2ln/6T/FU1naZlJT/84vIxVynco8q1H5p+R0yez175qnf/pqq/38e13X5I/v9g4Pvz2/f49739bvr6652/qfZz1v+XPa9++9t0/2O5c2bJ+0yEH20P2/3XeprO50mm7+F4PD4Sjg/5xkRZ85Pvz68pVwa1izS5LXx37h4AAAAAAACggY7ebuA+AgC6gmcaYAcD6AB6La0BQqMEAAAAAPqLd8Ju4D4C7fJthSzgA8oSYM/QdgQAwLb4Vko0SgAAfWf7WWg7fMAk8jdcVpQ/Te/a6Fr5yNtyF+7J+myDa/kK6KK8fjXKIHznYh6OP+tcjB+gFL9fuN3WZgU6AMikMqfBAQAAAABQeE/0D/cLsIMdHgEAXcMKdAAAAAAAesD2CgDTHemur2CAv3wYBLK9g4BLslajA4AJPjwj4K94/uK5hq6x/X5ahBXoAAAAAAAAADqFQS2gXXwDHWiX7cFFoOsYQAcAAAAAAAAAAAA8wOA5YB5buMNJyQeAb7MWfYuvC0gzAACgQ7ctQVsEVfmUZ9T7VVGUs65peny9a46/3+WFUWeLyqzVbnnH+3TvmlDl/mWlWx++Ba6bz7O0lW5F8Tcdj/F4PBOWK/nFlXgALjJRPlwvc7bi53q6dFmX0t7GLg9120ddSndMpN3Tonc23fZ10ftp1Z+VET+eFegAAAAAAAAAAAAAAAgD6AAAAAAAAAAaoFYKsbUsAAAAfMYW7gAAAAAA9EBym/S2jwfQXdQNAOrwoW1RNCHI9fgDQF19nxDJCnQAAAAAAHoiDEOtjhDd4wH0B3UFgCy0JwAArmMFuuOY4QaY43v50o2/79cPAFmK67eWIlKT7frZdvhAl7lUvliNXp1L9w/whSo3rrdfbB8PmORa/qw6cK77fufa9bfNdv1mO/1thw/AX6xABwAAAACgh3RXfrFyDIASBAGDEAAK0XYAAPiCAXQAAAAAAHqKQXQAANAG2gwAAJ8Eo9FI7wQWZpd2a0brWPN43TkQ+eE3udWWTiPJ1D0vG6du5Tn3ZN0H81v45J/f/H3XK//xdKsTV9+3YNJlK9+VV1S/u/38ULLTea6V8LO1c/2E32z40/w0DV+V2Wp1ku3rT5d3DVXqpvF4fOSYMser8JPxSB6rX0+6mf79Uf75kvYuYPv5b779ZjZ/mX//MNN+UN8pLYpX1fZjXn2TXr/nX18Q5KdvUf2Yd43xn8W/21pl1W3d+nl6/NFjqh1/WOv4Os+n9GMGpcNM11z5NLGteFPlu0rfiTvvLtna2sI9GV6STl7XLSdlz2FTcfz7/v7mhzJ5uE5dVbdPNy3fp51LPWPL/n6V8Jo4V1f6z5p7npc7ti1FzxlX0r+uuv2/yff7uu3HJtOv7TZBN7ixBlp3ApSp8ml6YpYbqQ+g13howhXkRQBd0VR9Rr0IQDFRH/RxQr5u+LaPB1xHHgf8k1dumyzTfa8f+n79fca9B+phAB2AE3iQ10faNYN0BNAVDJ4D8EmbdU2TO6vFV8q1tbOZ7eMBX5DXAWTpe/3Q9+v3Wd17xz0H6hvajgBgk+0tIDArCIJG07z4XH43IGx3oHWpAdalawGANFW2fcv6OXUlROznA9vh6/L1/aOpdnrWgLPN+1rluvJ+t8wW90Xn9PF4TPlavruq6f6FMuH5zPf4wyzb9VvT4fe9fqh6/a7Fv29MpH8T/QNAE1zPX6xAB+CUKt8QBHSR3wCgHOpKoB/qfBuzDuoUAG3gfQ/wg42y2vf6oe/XDwBlsAIdgJPaaMR1taEY31YS2UgfAF0Vr990V1ZQVwL9k7eS2sQguq0VYE3Vj3VXcNUJ3/bxgK/KrLakzQPYZ2NXlLZXo7umD9ff1fq9bP8v7T+gPlagA0CH0BACAORhqz4ArnGlrilTP6Z1VDY1EcD34wEAANCOptpttP+AfAygAwAAAD3AyzGAIn2tJ2xft+3Bb9vXDwAAgHbR/gOKBaPRSO8ElmeL2w5f31jzeN05ELrh11O2gvb//sJttucQ2Sl/8EVR/vT9+UH4hK8ffv2tOG1ffz5bn+JIpqe58N1O/+4z/XwxzXT7zfXrL+L7/U03rZ8m15ddPzV3fWnPmDbr5fRnXNH1F9FLH/3nE/U/3NNe+8d3tsuv7fD9kVZXd7Uf1sZ7E59NhG/q5lnyuitsj19M6Uy6qJuPdJ9fuhNF3El9AAAAoAJe5AAAAAAAAAA0bWg7AgAAAEBdQRB0duuxMAyZJAAAKagfAQDwR/2dwwAAKGbq/ZABdAC91fUGfNevD24rzn8tRQS90PVBdBHqbADNsN0+bDL8OvUjA+/5uvosBWC//gdgD+XfLt/bn77HH25r8v3DRP8ZW7gDAADAe0EQdPqljkENAEhXtX4Mw5A6FQAAAK3xvf3pe/zRL03mVVagw6oud3T3ge8zGF2Pn66uXx/cRv6DLV1YjZ41a5bV6AD6rrh+rHauqvWp7vuP6+9PuvEHdLhePnxH+vUb9bvfbNePXW//FGl6ByXXrzePj/H3Pf8hX9H7oS4G0AEAAAAH+fhyCgBtaKp+pJ4FAMA8nrXAlO/tT9/jj24ylS/Zwh0AAABwFKtBACBdU/Uj9SwAAADa5Hv70/f4o5tM5MtgNBrpncDSbBNmuTRlrHm87hwM3fB1+R5/2/o+B8d2+YEe38uv7fxjO/8TPuH7HL7vTNc/ptPX9v23Hb4u288fXb6nn9/xD8P8/gfTW4Dqdqro9kOMx+Mj52mzb0M3/DAMKh8ze3x6+reXBr7X3/XCb+4TMGbrH/e3WPXz/rsTvm22r990+LbbB4BJdvN//PmU9iwy/fyyHT50+f78nKrzLtVk/rehO3cPAAAAAADAYbY7MW2Hn+RafAAAAABAhG+gAwAAAAAAFNJd4WN7sNh2+EmuxQcAACCL7XaL7fCBPmIAHQAAAAAAwIKibTm7Gj6dwEgiTwAAXGR7gqTt8IE+YwAdAAAAAAAAxtHJCwAAAMAHDKADAAAAAADn2V7hU7SFe5Xz657L9/ABAAB8ptpStto3tsMH+oABdAAAAAAAgAImOyjDMLTaAWo7fAAAAF/YmIjoUvhAXwxsRwAAAAAAAKCvbHeC2g4fAAAAAFzj7Qp0tqiozsc0azPOeZ0GbadZMi51w6+bfrrp3lT8YZap8lX2vLbrJFvh9/W6bcYjvX7XDX86B7HOtbhyH9AtfXz+utR+06V7/+ocn5Z+vqVb0/JW4fZhhW7x9dc/r0i1LdLV76b9W5njy6pTVpoon/FzmM5XaenfZvhl41T0u4q993Pb7w/lfzcpCILC8tHGe2EYhlE9kyzjptK17+3uovxju3wl4+HbfWoq3rr9d1XqJxfbz/rXL7WOb4qN/g3fyooNTfVvpx1vu/1ioy/N1/ER3fD7XtaanGgbP5f6+2AwyG2/pv1/m5N/WYEOAAAAAAAAoBHsagAAAIAsvkxM8HYFOgAzdF90eVH2j+3VVH0PH35Lzp4kL8El5EmgnrSyQxvXDV25D32vn2k/ldeFPM899gv3yx8u1Q8uxaXLeH7a0dQOLtwzYJYP5YEBdAAiYmfgXLcBYrqB7kMl3hTb29LobIFtK/wmwuxTHusbOhD6re0tUvPYrt/RPS7l76Q2nq322692w7d//d1B+xN5bJSV4vJd/zxl8p7Lz5c2NJX+TaD9WF1xmTWzBS7K6Xv7xfT1229/6x7P+7lJttuftsPvO9/rTwbQAbDqHBHbjYq+hd/HhnOX1O0cBGwgb6LLTLRF42WGtq47XOoAbUrf2p+0n4pR58AVlE33uFo/6MaLfFaM56c9Jtqffbt3rrQ/+5TmaAYD6IDHTA18l32o6B7fd7Y7ALPuU1v3z/fwm7x/fWs4d0Fy6zQRYaDFIS6t4LHBdv0KtKnpOjdv4LyJFZQilD8dvtdfLtXPNtqfRe0n3++vruL36zZjU4+Ka/xa+n5ffVFcP7UeJcS4Xj9QzvM1uQLcx+en7f5PXbrxc6n/0Tbb+dV2+Jjw6R4MbEcAgFtYjd4/tu9Z38NXXIkHqkl7kQVcQZ5E15nK41krfICmuJKfbMWD9lN5XUifLlxDn3C//MG96h+en37jnk3YTgfb4feN7+nNADqACIPn/WX73vU9fMWVeADoDuoVdBV5G75zJQ+7Eg8cxb2BLeQ993GPAD9Rdidsp4Pt8PvG5/QORqOR3gksLLePh5m2rV7a77q7LcBY83jdORBth18tvCa3sis6V952ONnhF12/bvrmM135tLWFdt14dP36zYeff/664Ze/L/nlo+oWRln1f7aj5bfaNafHP6+uKZM27j6vmtb+82s2/Sfh10/vafg6dZG9++1b+6Hp8M0yXb/XyXNdqFvS6td67bdu020/V8m/aek/GJido61fvvLj12T70synPaq3n6qEb3oLSdvtd/Ptb7vvh0X0759u/Xq0/ZTXv5PF5tbzOuHr5n/d/J2W5lXSv+x1myrnuuG73i5os3/A1bLWZbrt96Y/IZd1flv1m2Kr/aqb1233H+qy3f7z/fg6fKpfbfdf67LfLujGGmYT78lNn9eEbty9mCAIov+Ausg/gH+6UG67cA0AYAt1qF2kv7t4PwagtFEX2K5vbIcPwB/UF0A/UfZR1tB2BHQlM3t8xgIFATrIP4B/giBweuZaXvyoc8xzPX8A0Eddahfpb18Yhpn3wYfnoO0V7LCL+29Wm3W07frGdvhA3/hcf9N+BfqFMo8qvB9ATzKzTR66yvd84nMDFfYf2L6Hn1Xf276uImnxdj3OXTJNf8sRAVAb7Ru7bKc/z8xiOtuR2r6/yKe7hSblp9vq9A+YLPO2B7Fthw80ifpbj4tbeFdhO36ub3EPs7p0/7p0LV1hu34r0rkBdABAv/jcMULDDQAAYMrXNh2awf3vHtuLXGyHD/QFZQyAy+h/RV2dG0DngQ1d8QqV/OQ212cooT0udowUrf6i8WaWzuo7QBf5rn203+wiz7uF+9Fd3FvosPmstD3p2Yey40McgS6pUuYon3axAh46uP/QMbAdAV1hGM78l/wZkIc8AnSLi40i6hm7SH+geyjXdpH+bstrC3HvAGShfgDQZdRxAIA6WIGO3gvD0MlBNwAAAKSj/WYX6e8Xn96R2WGq37j/dpCuAHT5UH/TfgUAVNW5AXQehN3S5P1M2+J5MJhuwqD+Pf7zvucnU1sgl2049z39fVV2O3VT+UtnO/cmyn9a+Glx6Xr+zkp/k9edFWZ6+je3CU9yO8wyL+Zdv/82uPD8Tua1tp6fTYVr+9MHRdeRFa/kTlSm4287rxWFb2OLQ9tpgnxpWydXuU9NtGPK5JG0XeXKSDufjXZInmn9aiV4J1W5b3nHNCnrOdhUuGUHmOqW1/F4fOT3y35OqqnBrbyyV+eed5Gt+ol+GLdVaYfXeS6nHWOq/KX1hZjKVzrnr9u+sf3OlMaHCQy6ytadLvS/ZT3H67afbbdfFVfSse3wXSrrvqvTZ2+7fuvcADoAAHBTXxqdfblOuMP2d0Vt6/v1AziKegF9pTsJGOZRPyFLF8sh+R19RL4HmmO7LHn/DXSgqi42SAHAdW3UvdTv/db3+8/1t3/9ttPcdvjIV2YFqE1Nzvp3la/xBurWHz7meR/j3IS+XjeydTlPdPnagCzke6AbvF+BbnsJP/zUl4eY6+XDxlbOaE9x/tM7f9E22cX5y2w90Jd6pow200JnC/+mwqf+sacv5S4rn7ty/aa/L2j7+m2ns+3wUSxra33Xng9VtiW0/Xyty7V09/n7q5N0pP1sUjy/pm0jb+oTVercttLf1/pFV9v1k+v9QziqyidybD9fyD/I48onWkyFb/r91Hb5BvqMFegAOqXutxPhJ+6327K+ddgFefmuq9cM97ic19qon12+fvSX3uQ+O7relnKtPeJb+9W3+PouawJOE/rUfvUl37pWP8FvvuR7oKtMLxSjfKOPVFsp6z/TvF+BDr+ZngFWZVVFH3VtBrKrK/FgHrMx2+fKDOK8lTSmuZzviu9PSxGpqfj5k3//befPNplYtdX0uWysRrehbBxMpUfZdq/t8qEbvu3jfZeVT/rQjnbtmurUj23nXxfqVpQXv/9Z985m+7Wt/pn4tbvcXo8rsxrdh+tAtir3T7fudSXfl6mTukL3+ky3X5vqX0cx0++nPrQfUQ33x22sQEcv8KDvPu4xyAP9xH3vN+7/lMsvVW3cJ9vXbzsv2g4f/inKM+Spdriczi7HrevqfgM9j0v302Rc0s7t0rUDdeh+vqENlDNgFp8tBZqhdl/I+s80BtABeI+GAxTyAtpCXgOqocwA7qFcusHF++BinFCfup/cV8A/OuWWQXSguyhvQDuCw8PDo/9YYYaMrdUetleZdMdY83jdORj54bu/BXvf56Do5h/f9f3+60rPP1W3oK1fP/h+/3wvf2afH10PPwxHImIz//ue/2wz337SaTs1tUV2d9tvpsu/O+Wrzr2se//b20Lcdvrnh1+cfuOZ30sqm271y/mgkfCrxmcq//6Yr3fS71/5fF+v/dtk+ci7d8X3YaAZvu/tJ7uq5pMsbV9/Wrx0trgte/3J/x8MfH//s812+8kfum1hnfZXljaeL2aVaz9lK5f/3L1+/1Sp313/hBTscr9/wTQ32i+2P1VR5rzJz/iUCbeIG6kPAAAAoBH9fbEE+kO3nNs+HgBMo54CAHuCIKAeBlBa0/VFU+djAB290Pa3EQAAAFxCOwjoHtuD4HSKAnAd9RQAmJf3jkk9DKAsFwfRhw3EA3Ba2kNcd2tTAAAAH9EGArql3Lbb7h4PAE3J2haedg8AmJe3XTJbqAMoq+r7pel3UQbQAQAAAADwlM63hF04HgCaxMQeAHALA+QAqnDp/ZIBdHRe2ssTD24AANBHZdpAtJMAPzWxJbvuanQAcIFLHa9AG3gG5ytKH+oKfS7nQZfjBiBb3ffTeJnXrd8ZQEcv8KAEAAB9RlsIAAD0DavRAcC8vHdNPiEGwCTTdczA2JkBAAAAtI6OYgAAAACALWEY8l4KoBUm65ph2nL2eIAuzhBqM04qLVxMB59N0/Xov9mSF35f7j/5vV9s3++s8MvGx9d8avuTErrh28437pjOQbSRJlXC4p5VV9Qm8SEtdcp63/NM3eu3nW4mwje93WU8zjbSzfY9S5O13Zz6+8DwFHhbaaGT19qo39LeX+vGoezxTb4f1y1rR58luuHbOV5xqawraeU8Hs8yeUP9TpPbVTYpvp161rtfmfjWvX9lw7D9/NaNh+4zzfYzsUvx130u1Xkmmt+iXLcBMs79qe7zWff3XHw++M7WDiBlwyxzz12pVxTb8ejb+7GN+KeF6Uo61qXz7tH0+euYefrxsAD6y6UXbAAAAABTvKvDBvKdecnBtqppzj0CAAAAzOAb6ACO4Ps0/cL9BupLrhqiLAFAOdSf1U3SqJlV//lhAFN8Q7o5ebs91il7lNdu0n0m8kwF0DTb7ce+hx+PB/U70K4jA+hVtk9C91Ex90NaeS9z7203IGyH3yW2t4MB2jSp38yHkcf3smZ6Cyfd9DOd/vrXr3V455l/D+E9J4sLbf82t4irw3T9ZDp83fMXlR/b9bNpLpQRk7L6g7p8zU0qyt/x/FM2L2Wdk3tSTZm616X6ycdtZ7vO9X5ym/ErF7bb6dd1OvVbE3nLpfrVdybqd9frN8CmQda3WWx9hw7uCcOQihToCco6uqzp51nW5KOm8RwGYFrb9Uxb9SdgQh+ey/QFmZP2zfMq6KurxvfyanrSFaDD9/KFfNxft3FvgHZEK9BZeY4iPs62Z4ZbMZVGedvJmQ47C/fHrKxZi32ZrU7+65em2zdpnZ8m2lK2tjh2vT3oevx06a4A9Z3pFbyY1XZ6tlV/dkm8TJhOouLyZzZ8n3T9/ZhyeVQTaZH17pX8WVpYru+w4Rqbz7c0Zds3dd/P+/5+7zvfyl/fng22d0hrO3/07f6aZvv5AKA+voGOSnzsJEB13Od+4X6j60y+/Jkc4K77eQ0AKMuV7T6p26ZMpwXp3Kw+5F2+gd6ctLxSdiJ7H/Jak3zOs7r3mrwC03wuXyhmYwJXkb6Hr1C/A+0bJP+BQogiNJSA7vGrXB95dAGZ/MrbANAe6kd3cW/8wv1CXWXzDnmsmi6kF1u3w1XkrW7j/rqPewS0KxiNRnonsDDg3myYY83jfR/Iyb9+U1uBpJ037wHQRPhVwywXvu79dyf/5W2nmX39dvKPO2zff12uxb9qfPTC18+f6fFtr36znX902cl/0/szpxV6GI4S/z97j8veV3v1o176j8eHIpK+1atIu1vM1f1+qM45i661KD9UCb+p7cy79Cxuq9PAXJoVlb/i+i0rDcrFuXz5T1+Bkv793rLtR9P3z3ReH4/HR8KxXafFFa1wrXN8lXOZOD4vn5UJM073/tnaYrduO6Mr4U+59v4yy9X6Tee9p8lPveWtnCuTdrrXn3Yu37bNzmP+Wtwuf20xlc667x91+jqLlLmWpus9U+lnKtyuMPGJkvi5dd+Ps/TxXRh95Mb4Y916wsYn+pp8JrKFO4Aj2KYPfhhIV17C4b8+1pu8hJZTN51IX/imL/Vg1gCvy2XW929Zx+Ovm84u3ycAgPv60t4BTLHRFuvSZCmga2wMsFfhxvQFAM6h8QAA1fSp3uzTteowMXhu++UByNOHuiEIgsxBdBfKp+ldvUwrin/yP3VM2fTXPR7oGx/qDaBtlAugHsoOAN+wAh3oMTqJAKCerNV8fX4h5JkylZUPdPIH6QtXmN4i05e8nlyB5tKni1yKS1KZ+18l/rorAase72KaAqaR7/3AfWoXK9HRJabb5ybejwGgDQygAwAA1ETHCcqicwAAAADoDt8/kQLY1Ob7Me/iAOpiAB3AjHijgpcAACjWx44T158VLn0jt6lz9TGf1dWVFc4+cb1OMMHlHUjy4uJSPLNUjaNLdT7gM5d3rwBc1sSkasodXNbk+xV5HYBP+AY60GN96eAEgDbwIjjBs2Wqbp7w/RvG6La+l/Gsb2VnfRu9bXlx8OHe+R5/oAsoawAAE2y1lVX7Pes/AMjCCnSg58IwdKKzDwDgP14+m8MqMLisz+3HtLLpelr4Xjf7Hn8AAAAAwFGuv+t5OYAeT9Q6W4i43sHhElNpVXYbUtNbqBZtN9n1vJJ2fVXKV53zwx19H5zpUv2G8kynex+32U4bRGrz+oueZUW/22b4Ouds4neLuPhciKdlU/Hr43bjdaWntdn2Y1E8VFi2tlAfDAZHwjZRdrLOVSfPxreW1Y2rjfqhyfjXPb6tcLPylmI6/U21X5tLv1qHVw5nEpb9NkPd+1+1nlAr8Ez3jxR9XsLUM7nsZy3SwjeRJ3hP7BZX2s9V8pWJ3a5sf0LJdvhdp1NvpbXjyhxXRlv9D66U86p009vX61Z8j79rqrTVks8cnXdb2/W7lwPogAnJwkjjCgCA7uClyX8mO9fhj6yyTBlHF1Hv9Vub9586tD2UawDguQPAD3wDHcjAgxwAgG7gmd4d3EsoPm2hDuggf7evzTQvCov7303cVwB9Rh0IwBesQIdVPDDtIv0Bcyhf6DOX8r9LcfGF7e9bs7WpPWXuvSvpn9zev6mtjV25vq7qe/oX5dWsrUjbSpeup38RW9dftBteG58gsv3sV/HoE1aio09sb8Hbt/olyaX2V1ufSImjrgVQFwPoQIytjgoAANAsnuF6+F5Yv/jUqZQcOBeZHYQgz8J1ZfIqA2v9Zur+5w2SU3fa0db3ewHANp4zAHzEADogvKwAANAlvr+cu7RCwIUVaSL+31OX+doOrrsCHXBF3dXoaF9TE3SqnCft/jfRPuhyfambPk3d3zrnZ9IM4Dbd+sX28bbZjp/p8HXrb9vpA7jMdvuIb6ADMnlQqf8AAAAw1fYLi+0XpD7xMa1Vez3efo//G+CTMmWQfG2XqZXgZXH/AQAAADsYQAcSGEwHAACYxSB69/icxsm2Om13+Mznsgi/kNfQDXRlAwCAdgSj0UjvBI5vweH7FifuG1sOX7fhbDv+umy/OOimn+34m1aUPl2/fqDL+l7/2b5+38N3G+1n04ryn+v5q9vlp2iLZdPlo87548cUvx/rbmGsd//6Xr+Y2sK1vXSzXf7tht/U/at7v0zXD8Vs33+3db9+8+39pdv5DX6xXT/0fQt5FPH9/bTr3Hj+tlEPpH26KG23OfWztDg1XR+5kfoAAAAAAACohE5rAAAAAF1S5x3HxHsRA+gAAAAAAHiKAdT+4t6jCHkEAAAAPqrSjjXV5h0aOatDeFkAAAAAyqP9DGQzXT7qnr/scbbLt+3wbWvy+vueljbYTnPT9QP0kM4AstiuH3TDtx1/AN1VtDV8kaz6Sf277vk7P4AOAAAAAADQBXRiAwAAAEC6Jt+XGEAHAAAAAMADagY9g6j9xH1HHuoHAAAA+C7elq2ygpxvoAMAAAAA0HO6W9EB6C7qBwAAAPigqXarqQmkDKADAAAAAAAAAAAAAFrj8uRPL7dwZzsq85KZtu00NxF+ne3MfN8CrWr8fb9e+MVWfrNdv9lmu5zbDt+1eMAv03xj9vxpfGq/1A1fN9669XtT6dZk+lc5V9+fb0qdNIv/ruvpZjp+YRhmhjH5mdHgO0u3fm+qftM/vr3nS3qa6T1f2ox/mqJw0665qWeizjmrtH+ywrX1TE47Zxbb7Sbb8bDF9vXbbjfrKht/V/O/0ub7Qzwt6lx3U2ke59O7Xh/plh9b78dN0Y2/Yvs6oCcIgtyyUHcQPC1fFNXT6t/ayFOsQAcgIm7P9AEAAAAANCMMQ97/AAAAACCHlyvQgarinQN5qyowQRr5wfUZxAAAAHALg6b9lnzPY2WQ+/r4bt73/ps+XjPQRUWrNevoe/0IAG1jAB29RgfSRFo60BAzz/YAuO3wAZP6Xr/bLt/F4RsN3nj4uvmL+jWf7fyrw4e6x/X0tZ2Gpst3U1tA1j1el+3wbevC9etuXdtU2Gl8SD+TTAy2oDyX6mdXtu0FmtLXuk2VYdvXb7t+s/381wnf9r1rQx+uEf6ynT8ZQEfnMTiMMnx8QbXdAAVQjo/1S5zv8QfaYPulDiiL9iPgtrRB9D71X9B/M6vP14525eU18qEbqB/bxfsdABEG0NFxya1tRNyZ/ecKlQ42VyLY5usWSL7EE7BBdwZ0U3ytXxTf4w8/+ZbPfGtT+pa+aJbt+88Avn0205j7W58L7TDT5beo/8b29ZuWNWmVyawoo4n2aFo5S+szTON7/mxqhbWpdNCtH3XjZfv4tvOfa+93XS9/gMsGtiMAtCGtoYFsfUqjrBmcAKDL9/rF9/gDbaBMAPBJsoM1CIKZ/+CGvt+Lvvff9PGa4Y6+lz9dptOM+2Me6QogjgF0AAAAAKiIzhUAvmLAHHAbbQwAaB91L4CkYDQa5f5C3jYgbb5wdfflbqx5vO4ciPzwu7pVVNUHorvXX3T/y+evtFmMg4HtOTZm87dp4/Ek/Hj+yfumVPLvddO/fLkdZJaFcnne7frLP02Xt6L0sV2+becfXdXjP/upjDm90MeHr56n3fplGr7d+i0uLdziLc7qpf/0vNP7X/bTME20JZprl+k+X/Kvtal46j2jmlHlWmxsrZe3naO77dd8xe30cvk3+/rLvf+UOa/t9nPWKqSqeSB5zWXq8yx1wyx7HlPlrLnni94nZHTS3mT4yePbrl/K5tEuyHv21Un/snm7yrmqHu/K/aszMBKP63g8rjz5pMqn8rra/9acdtqvWdq4Lzpt36YG/nSu02bbXbf82Drelfqx62y133zXVPsTumz3f064OsGk6P1cN3+6kfoAnMKDrzl10pL0B1CG7frFdvjovi7llzaupUvp5SPb6e/bxAlf4gkACvUWAACAH5pqtzGADiAVL4f6dNKwrfRPC4d7D5hhe/C6yXjYDt/EueCmLtxjdu3qD9vpXzd8W/G2nV55XI5bF4RhOPNf0e+iPvKyXaQ/qvC9f8b3+AMAuqWJZ9CwgXjAY7yM9hv3v30upnnd7QABVGeyjNmuX9oMn7rKXSbyQfw55RvT27ajfbbT31T4ZT9HYSLcKmGarv+7/nwxsTVvE+dJ+3Sg7bLWJbbKdxexA1N3uXKffO+f8T3+6CbdvNj3vNz364fbTLdvGUAHANAYAgBoMf3S4lvnP89V2OJj3vOtfPeNjftCXoCL8urXtEkgQF2+5yXf4w8AgMIAOoAZNHSbE0/Lsp1ApD/QDaZn3duuX2yHn4XVDnaw+8AsG3GsUybRHNv5skr4LteTLu820VS62T6+qrZ2FSmaROFyvnUJ6WSHSnfSHwAAwL4m+0f4BjrQY652UPVBme/9AfCfrVVbNusXW+FTp9pBurePNLfLdvqb3EYb6fqaViavOwiCmf9sxaOrSDO7SH8AAIB2mG53MYAO9Bwvd+2LpznpD6BJtusX2+GjXdxje0h7u2ynf93wbccb/nAlr7gSD6AIeRUAAMAOoxN/R6OR3gksb1HouuItnMaaIejOgdANP13WlmxtKbt1VlHhcj+vFd3/8vfX9nZj6eG7mb+bYjvNbadvGE6uu/711wu/qfqp+fvX9Jy2ovSxc/+bSzfbcwDzr388nvw8fp1t1m/F4ZuV9x1IvhHpAr38F4bV3x/K3PM69UOTnxDQfT7o1m9Vjs+67rpx1jlH1rmaOk9SEMxpXv+0/nQlz7W5BXsT+SxNW/V6U3k/fq42PzFiWt6zt+oxeedpoq4pCr/J+smGePyTW9Trlr8697lsuLY1/Xwr2sKzyhafputdW/0D7r4fJ+W3X+v2vzZVP9pSp13S5DXXyT8mwm+qLdd0+y3+uzr1W5P1U53na1PtzyphusTW9bvSfvPpXsW1+d7U1PHp93ygFQ9dfZ8kaLv3GQAAoHPStiRt+zvRNsMHAPjP184yAAAAAAB0DW1HAACAOrqwwgLdlVxppExnoNoOn/IBAH1WdjeQpidj0X4DAAAAAPiAAXT0Gh00AACTklu1tTWAXhy+2U+c5P28ra1yecYDfqLstodJVUC3UJYBAACA5rCFOwDIpAOR7Y0BoDuo1wGgHOpKAAAAAABmMYAOoPfSVmcCQBOSdUrat8m7HL6Kg826lXodAKay6mTbdTUAAAAAAC5hC3cAvZbVgcj2d+7jHsFlWYMQbeVb2+G7hnodAGaVrRebHlSnLgYAAAAA+IAV6AAAAA1LW8nX9spzm+G7iJWVADCrqF6k3gQAAAAA9FUwGo30TmChM9atDuCx7QjAKttzUGznP9+v3/f469K9ftvpbzv9dDWR/3TSwHb62y5/umxff9/zv+/Xb5vt9DcTvhrsc+tdAXBLGOqWj/zyT/nLpz8pIb/+LEr/MMzv/zF9/4quvzh8288vPfHrt1NW/E4/XUXtBP38aVq/7x/Xr8f9/O033fTlPQbdRv2tx53+07y6rm77ynVs4Q4AgJf63oAEAADoluIO9pYiAgDoFAZmAQCozp3pCwAAAAAAAECHMZAFAAAAuI8V6AAAAAAA9ID+wB0DfzpsD5z2PXzb+n79ruP+AAAAII4V6AAAAAAAAAAAAAAACAPoAAAAAAAAgBVhGErIB+4BAAAApzCADgAAAAAAALSMgXMAAADATXwDHQAAAAAAwLLiwVS+0QwAqK7o+RIEPF8AAEjycgA9+dDPesiHYWi9AaDi2nY8yqYR8tW9f/HjshqpeT9L+10bbOVf+C0tX6s8NPuz7N9rIvyic+XFs26YVc5l+/nQZLDx6y97PX2vX3SvvyjP6XaQFD+fjm5iVC38gtMXyt9EqTj8equ9yuT1ptuf8TDV3weDctev036pIy/dy5yzqXqhbv1uu/3cdPqbuI/J8+re8/g50tsK9Zm6f6bb76afj7rp6+tju859ayJ/J8+VdlxeOEfLdb24pLX/qtSVuvVLnXydni56zzf946X08WnXnPZvRXmu6Pgq9NsHtYJt/flaVN7z+mhsKr4/Y6PhpqlTZtsoX01qrn46qs32b9o5ZxW9PxSdtVz+K/scKXucqfPoKKrLi45LCoLAev1TxIV07yNbz/3mj691uHWuvJ/7oqu7KrGFOwAAAOCBrr9woX+6+pINlEWHNAAAAAC4iQF0AAAsYvAAQBUmVsd0QZ+utau4h/CJTn4NwzD6L/lvaUwMolPe/OH7vfI9/jaQZgAAAG7wcgv3Knyf0e17/H3W95eWNq6/6/m7OA3NbrHse/rpsl2Gq3zDsm/bmU+utx/Xmqbv198E2+W7iPkt9KvHpcmBd9NVVZXwXcsLfavPdaTdOxfupwtxyGO7/We6fvOp/dtU/Zr2eRAbWz5Sb9lX5TNvrqtzHbbLt0v1E+2J9tnOf31H+ptlO337Hr5tup+Za+L52PU0Rnd1fgAdqKorL6x19fX6eUGFC7reqOxr/aLUvX7qJzShi/WLS3VKMi6UW6A/qtSvaYPlaceaHEit8u1ztC/t3vv2DHfp+ew73+49AMBNtt9PbYcP1MUAOhDT9xe9vl5/cvtEXx7mvsQT6bIaj11tVPa1flF0B8/V37uWL1BeE6uWpv/eXLxsyCpPturPvPLtYrl1oT5WcUgbTARc1lT7LWvQPO3/TexKAv/4cO9cez77pm/vhwDK6/sK6r5reoeTqvmlyfzl4vsxkIdvoAOv8uGF1KS+Xr+r24eiP/qQ3/pwjXmaGDzXPRf80tR97lN+sXWtZcLt033QQTrBJ3XzaxAEM52G6v/zOhJNdzLSiemeLt0T6vbqSDMAgEm2nzO2wweqYAAdECruvl8/YFuXy2CXr62Mvl8/6mMQvTyXB8/r/C4AP+iW6y4NkgJpePbVR9oBAEyy/ZyxHT5QVjAajUTkaKbV2XqsyWNMFKYmXlSn8RrXOmd3tmDSnYMxNh5+Vh6apL1u+OXorFBoO1xTeTI9LkfvX7XwzecfHebTv538my09/aped9N5rnz49ervsmEWb7s50Azf9v2fStuC1/wWY3bnAIbh6Mi/tflMb7J9lBbvonZKGOq2/+rl3+l1V7//Jtp/bYSZFn78vHk7FWRtAToY1Cs/ReGXbd/qvwvolf8g0Bv4tlHW675rJJU5T3H9Ui79s8MqX/7r3P8m28/pz7Sj8W96W8O8c5at/5vKMybCKhN+0+/Xac+Pelukm7n/Zev3JsMsGycT4Zapo9KeL4OB7lcIx1r1Y1yd+tn3LXh1+7FsHV/vXW3293Q03a9pqn53Pf/Vbf9N842ZwRoX+3dNtJ/15bf/0ur/rHeZvGNt0a1LXK9fTdcjLpajNvh43WXzuu336FnNjV/ZuWe26++JNic9lH0naoMbqQ8AAADAaz69+AMA/MHzBQAAAEDbGEBH56W9bPMCDgBomu1ZkXXwPOwuW+0f8pQbaP8C6Jqm6jDqRwAAAABl6O5/pc3HzuYmhWHIy1oLgiDwclsUAICb4s8VH/Es7Lb4/U1uoebiVqQwg/YvAN+09XyhfgT6h/5XoL6yW9ADQNewAt0BYRjyoGlBEAQ0lgEAjcn7djjggrSBdPQL7V8ASEf9CPQP/a8AAKAK6yvQMcVsSAAA/Ofz85wOJdTlUp4vjgv5HP5iBRD6xqXnC2AS9Xt7fH5fAwAA7WEFumNoEAMA4I8udbzQBukWk994Ja8AAEzg+QKgLdQ3AACgCAPoDqIRBwAAAJfRXgUAmMDzBUBbqG8AAECeYDQa6Z3Awsort1Z7jXN/qhpj5uKsOwciP/6+hl8+3dPDTzaiTd2/osZ6lXDr5rWsOLRRzsIwP4y69688u3OI0tK+WrrrXr8u/fSzmf/aTL/0ez2nedZ68TdRv6XVP8lwkv8/GOjmn/LH59W19a+/OP3z8rdu+0C3s0f3vqfV33n3/+jvFsc/P/2qx7/ZeqVc+6HJuMTPnXV8W52AZe913TZJ2nGz159ef5av38rXn2XqtyxNXn/a79UJI+s8abLzmdn2W1HbQD/8cuFkH5f+/tzWO2qT7w9Vzqt7/rxw2ny/r/L8mOa5eJyP5t923pvMvp/m3Zcm7lmdZ4WN9nNb5aBOHKq2H820f/XkbZtdJu1167eyz1dT5cutvsyptvq/9FV/f5xtM6Xnsabey9o8vqjOjp9zet5p+pl8ZyjT/tapn+z2IWUz1T5r6/yYMtEWaLrPvk4cdNiKxzTcgdFwivnf/25SE/2TZdq/trid+gAAoBN4oQOgY7YDEH1Ljz5dKwAAaEbf2kt9wP0EALRpaDsCAGCLKzP5+ixtJllf0r2P193kzEHKb7/VXZngMxdm3rYlb4UaZTs/DfLSzlddux7o4fkPAEhT3H7Mf37ovp+78H6ftXNS156NNt+LXLjPAID2MICOTivuYGkpIpnh09ACmtjOugu69mKbte1nl67Rpj4OIKNf5YfnQjU+lfkqce3i/Xd9ANh2+F3n+v0HgLpcqN+abD/qvp+3/X6fl/6TuLQWlVZUHURvIn+mnUPdZ57fZrlQv/QZ6QsdvucfBtABANb5/jBFtj6tmgUANIN2AQAAAPJkTdoHAKApDKCj04o732hkAXBDlwcLeLFtX5fzUx+w+rrf115Hm/Ws7r3p+73t+/X3HfcfQFe5UL81GQef2zt12oU+73BWJq2buB99/gShbaQzAFsYQAfQWzTAYFMf81+Tq9H7mH7on6592qGs4m98txgZB/GNePQZeRwAkEa3/ejzgLlI+lbi6v2b9nNzbN9nAEC7GEAHAAAA4DSXV73YwC4FAAAA+Wg/AgAAHcFoNNI7geVOG9vh6xsX/HzQSixQV9H9K6J7f3XDt8329VO+/Gb7/lP+7Iafr6izRL/9YPv67Yavn7758Td///xOf93ww1B3hY1uZ2S/078KBsrbZz7Nbbc/3Wi/ZNXztvI6ZS3fNH3mNI93+/lR3P6od/1lwzfPn+cf4DMbzxTz709uh991ZSeDkM5AGt/bP7bfH+2qMxkuXhfqTqZjBToAAAAaVdyB0lJEEJm9J/7dgHj8yT+A/5r8rAsAAAAAAE1jAB0AAADoIN8Hp3yPP4B8DKIDAAAAAFzFADoAAACcwtZzzVDp6OsAle/xB1CMQXQAAPTx/gQAQPMYQAcAAECjijtwGCxpU/J++DZWdTQ/eXYBAHIxWQYAAAAA4Jp+f4EeAAAAAABYx+o5AAAAAIArWIEOAACARhWtImSMxJ7JvfH3BoRhSP4BAAAAAACAUQygAwAAAB3l+5bIvscfAAAAAAAA/vF+AL14hZPfS1TSrq/Na9INXx1fN866x9eVvG7CtxO+7+XXB1l1qMm0t52/fJf33CuTltPjbdev9cIvm3+KzttmPZN+z8yGb2MFePxauj7oGb++Ot/ujad/VlurTv1cvn5IP0ed+1b2mDrtR9vhV6tT9cNPC7dsXVY3zDrnMpHmaefVTX9Tad5k+GXPVYWt50rZ8HXf35t8/4+fK61eLxt2U/e6bv1e5hx18mraMU31D9QNX7WfdMOv2n5Ux9nq32jq/Uk3/KLDTDwTqx7nyvF1uNC/aaN/wAaT7beqz3Pd8l2nXDfXp1BenWOafKZlabv96UIZsz3WYEOV+rXJ9/MycdBp/7n+XGqqrOq3n+rl+bLtn/Ln8bOcmejfq1O/V9FknL0fQPc14wEAJnxvSAAAAMBveR2jAAAAAID+8X4AvYjtmTqwi5Wu/ulTx1Xf66fJd2yzZ3l2/foBZOt7/QgAaB/PFgDwF+8PqKpP/Y+2UT4B+KrzA+hAXHLADu6w0XClAWdfme0yAbTP984EG1vYAwDc5/vzDahrkvdpAAEAbQH/0H8LwBbvB9B56AH+oxwDQDXUmwAAAChCmxEApqgTAQBVdH4AnRlIiCM/uCWr/PJN7P7gHgNuKiqbdDwAALoi75NCrqHtjCpcz89dQ/8k4C76H/3G/QFgi/cD6EUVKBVsv3H//dOnl/y+58/k9fc9PQBMUR8AAEzgk17oiz69VwMivD+gOurJ9lA+AfjK+wF0AN1B47WfaEgD1bFCHACAehhER9fRDgSAfNSTAIAygtFopHcCCy+edbZYc/cFeRz9Le9asuM/aCz8emyHb1v564/fX3U/wzC//BXn2/zw08KclZ7/1N8HA737Ox6Pj4Q9W37N7iART99659LN37b5Xr5cZzt/9P3++p7+uvXroYjk1a9H2xRNtoXqdDg02xabpl9aXJL/1tSOF9Mt/o4+M4tkhamblvU6fwaa8SmX/5u45zqdW020n9PDz79+0+8dbW4Ra6OsF7df03+3qfZrlfBNSKb50fps7sgxzcYzPX/Xe1dtX9H9q1J+mqp/wjA8skWs7nOobLhHmXl/L3s9ZeKf9TuTMHTLd/X379k8dbT81Q2/6nM4mTZ10lw3/rrtX9v1q21l6yd308bP/j8b/ca276WJweHi+rmZ8KumWdn33qK412k/6LYZqlyr6fd7pCvqV+gLPlFim+3+z4kmni1pda7r3Eh9AE5p8sHHQxQAzKB+zRcEQfQfgO7ralnv6nWhO8ijAAAAALqILdyBHqjTqdFER4grnSmuxAMAmkK9lq+pFed9Vbzqt6WIoNdstV9NnEtX3qovpHPp/ol09x66ls4mmLh3uulW5XgX814f8k2evl8/YFKb9SsAoPsYQAdaYvtzB2lsvEjPhmk2TWj4AugT1zpHXdDX5wAD4PCZ7far7Xoja1s72/Hyhel00tlatksTlEXsT3Kpo274TcXb1sCO7XRXXImHLX2//r5zfQtk2+HrYuAcMIfygT5jAB2wgEEOAAAAAFlcXDWK8rp87+hEBfxn+xvdAAAAPmAAHeihvA4dU1tfutSJxMsiAN+5Wr+6xtf63rf4Am1oq/1aFH6b5TNrNTqqIw0ndHd46PrzyVa7QTdc33es8LW91pS266d4eGEY9jbd0Q+65Yv2AwD028B2BAC0K/my5EI8+hAuALSFeu5oGoRhOPMf8iXTi/SDbbbbr7bzPYMbelx55+E++qPNPGNicMd2nVWFT3E1webgua04AG1h8BwAoIsBdMCgvMaWKw2xPnZCAkBXUb9OMeALdBflGj4gnwIAAACAv4LRaKR3AsOzqPO+/daNGdxjzeN150D4Hn669rYAs339zYVvZ9u0afzNhG87fW0zU76g2M4fft7f5sq67+nf3vPD9raYJsIPQ71z6cclP/1tbwFbbJr/6m0RXT3/N7Etrfr7YJBefspvYWum/LmyBa/tMm9a2bxa5vrTzuV+upl+/vnZvijLVt+C7icIdPP99Pjm67868a+a3tN6ba7ScUf5034zo/32Z1JeHrVd/5YpZ8VlLP/3dMJvq55qu/3kO9vtvzrhN/lZnKYni+mGb7secZXt+sV3XX+/Mq3uO5ftT3i5w27/p4lJwWXbUy6w3fsMAAAAAEekdYj160UZAAD4yMUOYACAHna4A/pnaDsCAAAAAKB0e/cp9/i2cqcofqY7tVjBo4f0A5DF9/ohuUIxfj2uxx3+8738AC5L7pLi2/uTaUwqQJcxgI5OowGJPMX5w3b4budP3+MPmKRbv9iunwCb0rbI45liBp0dAICucOX9NG07ehe2qAeAulypX21iUhRMof/PbQygAwAAAAC8wKA/AMBFaQMqDLgAAAD4iwF0dBovKMhjO3/YDl+X7/EHTNItH8XHM4CE7srqgOa507wgCBiQBgB0gu12QtozlecsgC6wXb+6gDSAKeQttzGADgAAAMAZad8Ojf8/L5jNIj2rIb30kH4AsnShfkj7Rm4XrgvuI58B5iTLF+VtVlF6MJEMPmMAHQAAAIBzkqu26IiGCB00IuNX/xxYjQUAIB+rzwGgW3gPBfonODw8zP+FgorBRsVBZdWkcfGv5NLtuPE9fNt8v37THX+2rw/5bOffvodvm+3r73v4tpm9/qLOyiCY0wxfV737V3YAuYnO2qwwsrZSrxKmbvz79C7Qx0kDfbzm6saSXY/2/fliV53vHVc5pm79mFaumhzYKxtv/8u17fLl+8QZu/VLXjkIw1AGg6Pp28Q3zMn/Cs+XttSp33XzZ5XnU9rv+l8+3Jd1j0h71NWd51vXNdd+NP18cXEBhe+tbwAAAAAAemIc+5PBCNhnu1MLAAAUS3te8wwH4CpX6ie2cAcAAAA6xMYW12xTCgBTVTp8fK4/XenYAkzxuXwCQBLPbQA+caHOYgAdAAAAneJCI7uPmkp37h8AX9Wtv8oe51L96FJcAJPI60AxygkAoA7XJyoygA4AAAAAgBf4ChvsYpAEAAAAQB8wgA4AAACgNDVDmEEUACgnubLC1/rT13gDZdC+gUlFK+zIdwCALqqzwjz+TLS9Qp0BdAAAAKBD2nrBCMOQzj7AOeNX/2SluivS6mTqT8BdlE8AXdWVCX0AusP1dhdv1QAAAAAAAAAAAB2UNaEPAGxzuS4aJkf4k6P9aZG3PSMgHqeiuGQlvkvXUFUbcTexdVX6Nett4eBT+EXy8kSz1zzzG6XOY+OaTYZbJg6264gy0upC3QdOE9ddPg7+pr2OafrY2SJQd8ZxnedDXv1rq35pI/1t1i+69WuZcpx1jnLH5v+8OP7Vwms6fF264deNX9n7nrVdlvr7YJA+B1e3LaPb/mwq/CrHpB1f9rgq9zHr/UfnmptohzWZ5mXeQ6uoW0c1df/Mtd+z5sCPE+GOM35Pbw697vPBZFuzbpnNUrZ9XRRuEASlO63r5Fv9Nln6uXTjXDZ809ecds76eaW99nuT7WfbKw7Lpp/p9mva8erfkuW0aj1Tpm4Mw+rpPhteVr0+Gwff3qfb6wur/vybrRNHteKSd960PNdE+7NOWWky/Dps5d869WOTcW0y/erWT020z2z1RRaln+16sen306rnaqt+1d2iu2xYddOs7XZjVlx8ez4nNdlPlnxmJc9tu+zGDdM6KlyIGAB0nQsTCGBf1xpUALqD+qmeKpN9gb6h/QsAQPfQ/oXLaH/2G/UTdMwMoKvM5PKS+SSf4goAcIftgaGs8F2aZQf7bOdT9JPPu7O4hpd1tEetrNPbwYJsCvQXAwwAmkD7t3m2xz9shw80hfoJVQ3j/5O2ZREZCQDQB7aeeTxnkSVrayzyDEyrsxUkspF2AAAA6BPavwBc1bX6iQnSZg2LfwUAYELXHtiohoEpAOgm6nSYF0jRSvOp+Ddz9b5/3gTKBwAA3cPzHS4jf/Yb9x86ZgbQ2SYUANBXtp55PGuRJbkzkPo3wLS0fNbm7gdsIQvk0cn/YxGZayoiAAAAAACL6B8xa5jWQZX2XXRXFWUQ1+MPoL8YILDLlfTl+zvIQ56ADSrfJZ9TaVu74yg+tYB2qDxW7X23OG+afX+m/Qu4i/IHoC7av2bZHv+wHb4u2p/9Rv0EHcNkBiIzAQBgXtrAOYPpAFyS3AWBAfTy2D0C5qi8VWUbd2Ugk1Xo9rdyBwAA3UL7F4CrqJ9QV3B4eFj9oJoD7lmrWXSkdeT5UACmaTDO/b3ia9Ht/MgPv1i98Mtev5KdDuXCbzLPzcZFN/2yNTE7qswMu6zfaaMc9X0GoKnrL5/fB1rhZOX/quEnlY+PnfqrKPy051LaANRgMBQ91a/f9gD9bPi6W8jmX3/xQJ/t56eeNu5l3vPBVl4qW78Uxc98/XpUE+nUVvhNtZvqlr/i56PbKxx06aa/6fZjU+FkGY/HR84/+0zND7c4Xnbr7yLV2lFH08qGJp4J7U3QSa9/yqe73TRv8/0pLyxTz1Hbedk0l+p3++8CZsMveidzsf2aputlwpT0NK/+/pfV/2dita3pd7q2ylxd5HU9thZouFK/2Wpf2H5vKmKi/JvvKzgalgv1g83xE5cmP7u+20RZVepH3d57J7hQiICmka+BbnBplqOJiWywh+dEtiYHzQG0K62ssu1eGrcnAgAAAAAA4DPvB9DpSAEAuMju7MT8wQZbz868XS9QTd49bHOgyfV2mOvxA3BU1mSv6f9Trl3D8x3wi+32Ud/DB/qIcgcA8JH3A+hpbG9LBQBlUD91mwufGHFpuyPFpbh0TZuDF77cR1at+qn4njFQ1wfJQdnpM81WjJCHurYdvqez7/H3ne3073v4gE19/4QGAAB1dHIAHfAFkz0AAGhefPJIWmcRz1wAgOtcnAgJAEAdDOADAHzk/QB6/AHLtnEAAFe48A1Xmy+hdPq2z4Vv3Lt2312LD4DyknUZ5dgN1KvtSO6+QHrDJNvluu/hAwAAwE0D2xEwiQF1AIAtQRBkDqK38Xwq+kZ2W3gWm5GXrrY7H12gyl+yHGaVSwDuyHpOUn7d4lKd3zVpaUt6wxTbeavv4QMAAMBd3q9Az0IjGD5gNQHQfS59w5VnY7ewWqYYaQP4J61uoywDAAD4i7YcAMBHweHh4dF/TGyLnvWQa/rh1+bWo+48uMeax+tuIpAefvlOebPhK9nxKA4/Kz8lz1lvNZ/u/XOH7YEY2+F3STwvZ6Xn5HeOlp9q6a+X/8MwqBFmc+Gbqr9shF+l/LizJW530r+Iifqtzj03EX5clc/qFMWlTFswr37TvVZfv9HnSvkuznPp5a/sO0AQ5P9eU3k+Oz7V64/ZuJipP5ou62Xa0Lq7YZS/5/Ewy12frfZ70X0w/a7bZL6v+35u8tqTExPLhDsbh/zfKX4+jWqGWz2vtynvuV70zK92/mbaX3XTqW49qft8tf18thG+i7sl2VI239luf/reJ1OcfnO1jpuq134oe999fVesU7808Vxxje/lx7Qu3nOgPW5vIq5bvl1f7OV26gMAAAAAAAAAAAAA0JLObuEOAEVcmeFtK3ygy4rLV0sRqcn1GZiuo34FYIrv9bPv8QcAAEA1pneI4/0aQFcxgA4AAADAGwwAAjCF+gUAADSNAWwAvur7+xED6AAAAAAAAAAAAJjBAD2AvmIAHQAAAAAAAACAFLorhNFvugPQDGADgB0MoAPoLdsNUNvhA13me/mig0aP7/cfgLt8r599jz8AAACq4f0YAOphAB2AhwYiMrYdCQAAAAAAAADoLL7BDqCvgtFoFP1P2dnm8UrRdAWZjFPd8KjIs+gOQg4sh69LN/66bF9/kaL0aTr+bd8P19PfNNvll/AJv8/h22b2+otfsOc0w+873/O/Xvgqf7Xdvp+GezR/x/N8cbxstz/rmV5j/v03dV/qvKv6SHcFuOvXH4ZhZhyTP8tLC1v5zH762q6/daXHv73ybfv6betm/vGH7fQDdOSXv+LnJzvcAEA97rR/bLyT13k/LvtOWYYXK9Dtv6QCAAAAQDr1vtKH7a9tv5vZDt+2vl8/AABwT3H7pPttZABA9zg/gJ58ACf/vw+dVAAAAD5hgAddlreClrwPAAAAAADgP+cH0BU6owAAAAC4wNY28gAAAAAAADDPnQ30AQAAAAAAAAAAAACwyJsV6KzyAAAAAOAC3kkAoHuKPhFI3Q8d5C+/cf8AAOgf5wfQk98Y5JvnAAAAbivuYGopIoABeR2ked9HBwAAAAAAgB+cH0AXme2EpUMKAAAAgEv6NMnX9gos2+Hb1vfrBwAA7mECNQCgi4ZpDziXXrrLxCXrd+LXlrxO29eo08nWRNynW+Ln/7zJ8NPPWT0dyoRfPn3NhH8klMz46Iefde4gCCp9+sD2RJVJ+M2W0+J8UC79TaWHqQ7Quve9ibCrMB123irAMAwlDMdHwqsS9nhc7/jpdZu9/yV+s7EwC0NKbWs0f/5qO9aY/TSM6QGOovxnugPD9GCh6fMXpX8y/Kbbka7mu7Lpbqr9WLUsV8kndcNPP0d6/amOr/t+Va8uy2aqHVUUvzLtkDLt17qKwi86f9rxde5J3fB1FbV/qlDnabKsFcWtbFh125Flzp/ffmyu/VQvL9gO/yhT7d+8+qVq+GWPb6J+y/vdJt7T8hTXVXrh132s1GlHmYh/E/Tq10HuT4tPMbbybGmyPVEn/mXDLwpHt0xViXtTZb3J48NQ9/2jmfZZEZt9UUXh6/W/Tst/vWfZuODn5dUJX7f9VPfYKufQoRu+qeN1P2ncVLyL3o/Khlcl7LTzVU2Hpt7bbI8j2lan/On2iehqss7Ib715ouyLFQDAbW03SlwdBAPKIP+1h7QG+iMIgtITVgEAAACg6+gTQV95sYV7HjXDPmsQncINAH5g8Bwoj/zXviZWxgJwX9aqa8o/ANto/wHFKCcwJe19kPyGPiCfo8+8H0AXSR8op4MDAPzhSmNM91MGVY535Zphhr1PYaAJWQNolFvAf2XLcbKTlC38AABwF89ntKHq5zIBkW7mFdufgq3C9fjBbZ0YQAcA+IlGDACXseocAAAAAKDQjwUA/dGJAfS0BxcdngBcZ7rRXVQH2m7z237piIdf53mhezz8Vly+zObvrue/ovRr85qzVqMD6DZTO1C4VL8BbbPd/ke/Uf/2E/cV0Ge7/rQdft91vf8JyOP9ALoqwGlbuPNyBgCoQ/cZwjMINpH/zGByJtAPWeWcyTQAbLM9gRPwDc9sADCL/id03cB2BJqQtQIdAICqdF+yeUmHTeQ/ANAThqGx1ecAAAAA0AX0P6EPgoODg5kOgbSV3EcOyvn9tpXdwsN2PJOm8QqP/Fua7PjrzoEYax5fPvz06ysXvu5K0Kxzlq3oddO/yQfKbFx075+uous3FT9z6d5kXWF+hUB6+qbVe+lxGWjGo736I00YjnJ/XnxdR8OPp1Px8XavPx5++Xt+NPw27n88Lurvg4HeJjhF979Yt/N/mjbrt+Lw613/NNx66T+Ng274OmE3EY759lNaXKblV7f+0m0/Vtds+utpawtC3fuvG4+64du+/jrlr+myVlXy+Z8Vn0kYR8tftfZDc9dvoqwVl692tuIvw/28nkb3/g80wq4bZlz+89P0+1uZd42iXTDKnj/9HHO1jp+Gbb7/IT8Ouu3no+lf5Z6Px4cSBEHlezelF/94/2EVVctb3f4vV9uv0/PO5f68OHyz+b+J+ie//zP/eFe2aLaV/rrK9iVV63OKs9X/mq+t92P98PPTz3z/n9+q1E9p/QdF6evauJ173FkDbWOsxfZEjSFbnwPwj2q4uPMAQft4VvmBVXxAdcUDQC1FRGYnHFJ+yyGdAABZeEb4i3uXz6X2q4/IX/7jHqKryubtrP4/ygZ8NkybIWJ7VL8Kn+IKAHAb3zhujs7qGQBuodwCAKCvaFUiz1u31V95DviD/FwP9Tv6jP4/dNnM/qnJgQMq+O4zv8U0APiFeq8ZaStWSVsAAABgisGqbqD/FEXqb91tHwsN6iHN0Bf0/6HL2P8YAAAAAAAAAICeSv92PINgAID+mlmBzndK+4d7DKCv+KavWWnpysqM5hR/Y5DZ7oCrKJ9Ad7HDG6pSeYJng98o26jCxfdi6qDmUb+jL+j/Qx7f68Bh0ewy1y+QDmQAgA4adWZkvSxOJy60HiUAJTGpFgCA5uW9d/CsdV/WBGwGyVBGsq/dh/a2i3FyFfU7+qy4/48yAH8NkxU8GRoA4ANW+Pgh+b00BtCBYrY7YJMvukw0qsb2/QMAuIvOZH/RHspH+6eesulG3nMf9Tu6qmz/a1b/XxHKDFw2HAzyP4PuYgauEifd+Df58Iufa3q+aUXiYlqbMHudZnYQqFKxNxluXnh18pJu/is6Xv08a+ar6TxpegDUdpmynX5x6dvp5J9HN9/lnWMy43qcG15T9Xe2o7ut1CmfmWcvrF/qpXvZAWhT9VudAfCs7ZyyflYm/LLhZJ+nUrCV4pKMR/rvma3f846Jq5tPmiwrVUzDrdd+aGoCR50dkMrUjXXCz0vfqmHm5as2Oo1NdryWfTaZpLNCrcr9M830bmXJjpeyP6sjLV8Ul+/88yTP14SiNC+72mOSfkfP31TbIC3MqmH5ssOcqfdUU3xPt7zzVKsf89tPZd+bdZ+ps3GaDb9oFVfeOXXj3/T7V1o/Q91n8KQdUj8uVX+e9ns68VfH68Qpry3WRPhF8Wqr/Vy1f6LOvazze1nR1x0gykuXptp/k7wzmPn/qmHaaj8XqbOSP60+1a3fy5avJvrZMn7Dav1k+v1YN/zxuLkdH5rK802Ub1fa3XX6ldscH6mrqXEZpX7/J5NzbBoW/wrQLVQ2gHsolxOkAwAA0EV7AmiG7YEhXbbj3/SkJwAAdHWlnez7ojPAFwygwyltrfxxhSsvk3VXyPvO9Ap4lEM6T5AOzaqyAwEA9JnuzPiucaV9Xlfe/ZtcW7/vL5CnaFcX1+vH4vi3GJlXMYgOhXwAwDbXn+NlMXgOtIcBdDijb4PnLsgbOCe9YJqprQN91MdrBnxGByC6grzcD9xnoB7fy07b8c/afp53HQDQU+cTQy7RXcBkasDYx+cTg+dAuxhAR+fxYMiXNiOcNIMtfct7fbteAAAAAN3GqnMAQJyLfV8uxikPA+eAHQygwxkmXrJ4OLiN+6OnS40nl+LSlj5eM/zhe/70Pf7otuIVJO0NOjDI0Q9Zq0IB5IvX1z6WH5vxr1Pv0H4DAJjm47OmS/2/gG8YQIdTkhW6jy+pVbjSgdrXb6D36Vpdxn2ACb5vcQYAbeE5PMv350fed5onbf6WIwR4JK8/woe60sX4M1ELiiv9XwDa58oz1JV4APDHwHYEAAAAAABAM8IwZCACaEAQBF53tvsefwAAAMCm4PDwsPpBsQZ4lcZ4U1vHNfsCMNY83vc5CHauf5oHJuHXv6d+pv90tbftji0/0687dMufLt/vf376FT1rdJ8lYZh/vPnOKtvPL8K3Gf54fPT5WS3PUf/oyqpjTJb9+G4xTYVftl3eZge8iYG/rPgX7cBjYxDSpcGO9OvPrz+K459f/ovTXDd8PabbF66Hb//5WUT3/TRflfQ1WX/UretNbOldp/1RN+wgmCv9u+n1u+/tR11246///mQ2/DTN5p9+a/P5lRZWVv2n/j4YVG+flInz9Lj881dp35ep05P/XzZ9s39Pt/zZbr/0G+mvK738Jstidjrrjn+4I+0a0+qktPqpC9dvh93+M933JN8ndrOFOwAANdDwg01p+S9v217AJ01v8Um5QJNs5yfb4QMA4LO6A8u+MTFhSkdX09kXpD9MI4+hqxhABwAA8EzWDGdm9gLk/67j/gJMmiuSXF1KWrmB+9Bvtu+/jd2j2pS1Sj3tZwDQJOoYiHS3zc0AOgAA6JziLcpaiohhya3+GECHCFv0AYApLtWvPPO7x6X8haNM3p+udjq7pGiL4a5p6jOqAFAHdU8/dfH9xP8PUAIAAAAAAPQQHZSz8r7NCbgmDEPyJwAA6JQutW1YgQ7AGtsz7G2HDwC6+vINPwBTtF+6jfuLPFmrOrq42qOOvF15Jit8rUQLJfm+g1TV+rtLncs+SKsf4yv/u3Y/unY98Bvt226L3z/qnv4pej/xHQPoAAAAnun6N/x8RweBXUws6TbKF8B2z0X4BrqbutKR2oQ+poXt53fWQHlX7kXedVAPwrSulCM0j/qnP7p6rxlABwCgBtsdAOi3vn3DD/3SdAdMV1/kYIft57/t8OEO6jbATww02RUEQe5uFV3hWj6j/WIX6Y//v7073W7YVBcAKqd9/ydu7Psj18eOoxnQx7D3Wl1tk0ggxIyEItRWD1Fej+OTf6dpuZL87FSkUmheUtLiikw4t91ZifD3bvFxNsz7/f7n+DPbiqRc89pbgo/HPUv4Z/PT+2lLpH9qmT87kGmlronuwM6FnyPM1PQ/E4czYZ69/tdx++N5RV1zPPw+JwqetrbiS50oSa9n0sJf2oJw//Hrv99zrqW474tH2XoitX7dejNl7fgcbdBcv2tuou9I+Gv9/aPnLdWXimi/r9xubm++i+o/LZ3n6vBT78lW+HvLd2r7cLaOLNXvP3P8fFva9gRs7eOErXwz9/sjee1I/zfn+PB1rrT+d2qbk379+frPJeq36OO3rylPu3Rl+Hv7gGfq1j3nOHKvzrYvucp6ifbpTP1wdP5vLYwj4efqvxwJv/Q83pn25Xa7zabFVvrUMv93Zpz3vn5Sqv8Z3X9JGR+XCH9OStql9r/33p+z5WtLqfp9b/26FN7alt5n5gfO1g/R45O99fvy/Yq9jq351b3xSq0fo3yFhg4XiC5kVxjhGgHOUD+Sg3wE/VK+AaAP2nRa0XpebT3+HOeelyeNf9SWDhbQ6VptBa6kka4V4Aj1IznIR9Av5Rvo0ePx+PUP9ExbHs89OKb19Go9/uznXl9HWv+oKR18A53h9DxwzP3ZBcqqqTGA3qkfjym9hXCqq7barm3rKCCd8g2MILqvxl/Rn4oZkXJwnc8t2lM/idOb1vufrcef/I5ux85+o81f1l6/eAMdOvP5vSEAfqgfOUp+gX4p3wAAZdj5Yl7r/c/W4w+tGHH+stbr9QY6Xft8AnIkoz2tBLDXT/0YHQtasfQ0LNC+iPJd+w4fQB9GnA/Yrl8visigotu3kef/aMuZ/md0+XrX4vi41oW5Vqhf44w2f1lj/eINdIZVU0EEAOpm0A39Ur6BHj3fXhrxLSZ4Z/6vPAtsx7VeL7cef/JQ3imhpvrFAjpDUrkDAAAAQL/M/8WQ7tA/5ZwR3P7777/jB709AXDkaYASr+DX9DTCEc80uN0ef342Z/k6U5+BuCcefy7817XuC//sfU7Na9vhbl//Uhx+tuD4Tgz/XNgv6/HfDn/9/qWGvz8eZ8PPF9a81PK1pc5noI6me+56fG/47/Xv0fM/Ho/ZtjDnFlw5zcfrKzEeMe1HK+HPpfnvtE4Lf6v9mBOf517ObEH3+62GtGtJb1eO578c9790+M/zv/qpt9nfn0m/iL5cjjyfa9xyJC7bYab2n/fnv/m4lO2/b4ef2n98xX8uT5fuP6bWX3stxWm7fo3uP28p2/7nHD9GTCpuh3//83dLyuSF9PHL+vh6u/+xdvy2tPwXX75ixo9XzAFu9VF+fp92/263f1Z//36dc+PDvfN/v8PMN37YO34pNf+YXr/uP/49rNd1rd+/5XCf6bGVf77+hJ0qok3Z0396t5Zvrpwfieiz16T8/HdquFvzz2nxT51/SA23dFmNzpdR+Ysfz/FjVDqWaNfm+kxXhH+Gb6ADwEE6f0Dv5uq5Eb+nCkBf5toyfXvol/4rQJraFzihJAvoDM1AGViy9CR1id1UgLy072me6Tf3Brq0pXcmiKiZOjgP6QhjUeZjeHgBgNZZQAeAGRaKgJF5Ax3okTqMNdtbwF4UEWhQdP0aHT7zvIAAHtCFNbXn/38VYEYW9Y0UAACgPsa/AAAAgDfQAWCGB2gYmQfMmNuFw8IiOahfWLNdz8g/NUu9f1vcX+CI9zpDN7aspU/gQQ2MPyhJ/uqbBXQAmLHUwbGABPUzgEnzXDyfS0eftwCIo33L4zMdpRu0Tx+1Du4DAD2xgM7QdOqAMwwKgd55A51R+cQZ9M3DYdAvZRkgP+MfRra4gF6iwxFR2ObCrKEz9YrDY+ZnL8/4L6VdBZdyyuta+3/Dcy2/Lb3dtXVcLlvhp27BtD0BmXZ8evjzkye5wt/S6xskR9M99xsg+48/V8/cbrc/ZedIW1Oiftsqq7+3routX19xTTt+6f7tX/C7fou53/XL/r9dcySf5ewTRfSvfocZUz8+r/EZlbPpfzap9vafSrXfcz9/pUm+uiW1fZzrP+9Ji7n26Egapqb7mXJfsk0pFf7W8dHt1Bk1jTnPhJua5mf7zy3e6znR/a8z4ey5Z3PnLV2/7T3PkXbq/bi1eOyJY84tilPK6t7+x9I46+r6aW94Ke3/Vhg/v9/Xf8iRPmeupZYtsI8uQq/1P3+f577rPMvW8/1W/r7dztZD68d9jm/X5tlSbJX7Wsb8V+ffVvoSrc//7Unno3Ngv/++7CdecvZ1U+OS65gr7K/f14+Pkqv/uq+Pkd8r/K8i598r55zP0b7s2XPmbBP/XeoYRWdwyKHWBgiYp8ySW6kJDKhdz/WpMg1Aq65sn/WDuVpK/u657wrQss/6WX1NTZbWtnPl03+fJ1wKrHatDwZajz9ALi22QbTB5CGjUZ8CQH3W2udSW0/rB3NUqR0IAWiT+p2aLb0hn6v/+2sLd9+KYTStb6FD2+SvF2lBaVdPHpb/BEXS6SmsxjotxxbyAEBeOfunSxOINfZLerSdznV34Et/ylM2ZGSt18Olt0gv7bpPRQJRlj63mlp+/3wD3SI6AFfR3nClEt9qBq7X+gQOAJTkrXMAAEg3+w30308IWtygX/J3rOj0jw5/dNKfKD+TitGxgHLe61cT6ABQr1IPeLb44KjxYZ1eb3Ct/53+J2uUbwBKKrUDU/PfQG/9DZTW4w8AQDt+Hp6NjkUa/WMAWrS242Op+Thvo5MiV97pof8JwA+fiqEmS32VXA+T/tnCHXriG+cAAD9MoANArJZfYIEz9vY/zd8B1K/EN6YhxVw+zJknb//999/xgwpF5oyl8Pd20KLjP033xOO/hL/TkUo955NUa0/BXDlAmA9rPf3Ll4/o/JMqNf6pxim/R1zXgYu+fuGPHP7j8T1N0/l+UGr5WHuDak8f7Gz4r3OnpV96+PfV698+fx/5b0upevjxOH7e33HZn37zbcp6+pVoh7YmKua2TV0Ov2z/KfX6Ux/0iB/fbdmXf87KUb+nSqkft8Pfzr/r4f9zMtx9ttP/Ff9zYf7NP8fueb7yv1XW567vdvsnaXz8/rfnrF//dv9pPv/kCr+8tvsf0i86fFKk12/z93+uLk5p06L6j6mua8frFPUAyt5+f6n4WcCNJf2vEr3+8BLxUsZS+/aZ/1LXiZd4Ax0AgKwMoKCskcvYyNcOAACt0X8HcrvqM0XdL6CroJmmv0+nyBcAALTifXCoHwt55Zx42X7DKltQVYYPAED/fB6OGlwxN9L9AjpArXzjqyzpC0SxgJFmezAem4BRkwXPdmsu/CsXAFmW+qDuCGlf0zXWFJcWtP4g+k/8o2MxtvRPVGSKCEBnorZQv+r8qWqPX0uOtuUeAidV9Jjt3/RvkNVNBcnSJKN7D9RCh5Le6H8BpdRYv6SOmVsfc7dImu/Xelq1Hn8AaF2N/XeOO9Kn+vxb8560KvkN9N4X4Gnb59bt0/T77R2VdiwdKCLVkv98YoIe1VK+RlX6DXj9/7K2Jhfefz5iWqfWL7nrp9yL58pXWUvpZ1JvXuv5rfX4A9cxfqGk0fNX9Bvw0Vq//0f7z2vXa96THK6cE7GFO0OwQAXUyA4Z9EoehnRn2oMR2pCars+b533IeR+282fZe54z/NbzZ+vxB4Be1NR/J4+tRfWtY+UJ9orOL90voCuMAABA7ywWXcvieR/ch3mtp0vr8QcAqFXK4vn731q3Y6/I/PLvWuB7IlXrwOR9m+73/7/ae/qciUPq8Wet3dcr4nF0K8MtS8dfkX9vt9viW6ZbUvNvrom9cukX21DaQihmC6FXuH/Dr6HzVDoOEdc/f69jw6/gVidJL995+ieR9UzJsJe+l/VUQ/65Ku23yk+JeNzv9/8P5xXQmXHB0X5sbe3m3KeAfuzLgDm25j6SJrnq8NLboW2X7/z14pFz5lwY/xyT/v9fHA6/hv5RKbnv/1Gf4fX6iYTXuG75utbq/OcxW2mS8vuz39WcyzNHxuBL1712fKnx+Zn8d+yYsvNj2+Hnqd/Pzk+kf+Jj9dfJRqv/P6XevyP91zPl6yp7+s+pfcbU8M+Eu7euqjXPl84z0esXZ833dfMrPX44Gv6n0usOZ9eHSqXTkS3b956jhJrr+lbNpVXq/T9Tvkq2g5+afwO9p0EtAAB/LU2EU45BJFdRvsfm/gOQi/4rjEH/EbhK8wvorSj1BjUAwAgMkq+j38nVlO+xuf8ApNJ/hbGM2H+MqudSd3CBlllAL8zCOT3TgLZN/QLUamkrOPVWnN/bxgVGhOYp32Nz/6Ff2/MDseEznqjPYtIf85+xRu8/jnKdpUi/NKPXb80voGvAAAD6NOJT5TAK5Xts7j8AQB6Px6P4d7hroP8IXK35BfRWPSv7sw/ApB4PI9CpAmjf0tPmlPM++SLdKUn5Hpv735/oN5CBduXcwVO7wojmFtF7LAv6jy+v9SELRFBK8wvoLVaWqXFu8ZoBAFJ42rwOPxMz0bGgN8r32Nx/AEpaezsXevKe13vvW43ef7zy2kdOZ/iKjgAAAFA/A2cAAFqi/woAnHX777//1v9g4wm9I0/w5XoC6sy2PPU+aXhPPD7tGYjH4/vPz46lVeozGNHXv55/SuebufTPGf6ZsnZFWfmM1/kwt+7/fP7av8VN2fz1jF899dPR600rv+lbDc3HN6WNORaX9evfrl/+ORBWjeGv276/qfV/qrbbrzP3P2ddk96+5O+/HIvLufx/9Loj2tR94afl3/v97/lzXOveduHK/v9cnNL7j3naz/Ph5wvrXDzWy3/pie7bLf9uYEfS/PH4+7fHvln5N//kHL/t7b8uydm/znn9r3O9wi/xhlbr47ec45f3c73+/mv290flrN+PnT9///Vsnf5+3PO/v762yvdt9ZzbUtuv1C260+vvtfS8clx+Lv9Fix4/nVPLvPFW/i9Vlx+dd8lZ/x2p51P7D1thPcePuccve5Uen0eHn3Otp0y46/mnxPjg9/nL3OtatnDfvg8/6R/V/2hf7DvQqeOTGh9kmx+nzPMGOnCZx+NRZaXJWZoQgFFFD9IBgB/aZGBJVP1Q49yfuhKAo5r/BjocEd2Biw6/lKU3yteu1zeo+tdrfocaKF9t6LWtK/+GjvxNOdE7UAH1u7L9zvUN133nUb/BiK6qz+bqoFrekO19/BIdPrGuHt/Ib4zEAjqhWtmCsofwS1nqIM/du17TAACW5J40il6U/7me9TY+eoIMAFJdueiz93MCxtMwrtrL/9riea2MX+C42ss15GYBHQAACktd+I4eqEaHDwARoh9cA2jB3GK0uhOA1jW/gL7VGJvsq9uVnalcW6O1Gn4pc9e1dF/ff95jWlAX7QP0q/byvfTW2tm32Wq5nqet9twW2VCv2uqTT9H1Q+n2pXT6R9/f1m2332XOn6KlMXbr5Ss1/OgtpKPrV9aVyL8564e9x8/lsxrmQ1PHL6yrfXxOPjWUZ7hS8wvocMTSQDgu/EuDL2bPgvk02R5pNDrQUI7y1YYcb61F38uj4ee4ZvmbkvRBgS2l3zo/e/6t47bbz8NBAo2I3i3jM+yW+ls9jF+iwyfW1eUten0FrvQVHQFgHLfbralONACkShlMRg9EzyyeA0APam3Tao0XEK+W+qGleb9a0gyAOv07Tetvj+ZsSDRKL2tbgC2l09kOyNr5ojo1e7dAK7HF2bsrrj/X/ZxLi5QtlCJFx+cZ/vYWZ3nD+/QMPneZf51/+SnaqN0Aonch2LrnOeK3t97KucXeXJgR9/Vs+Cl1/dI9264fy7YvpZ1Js7k02VNHzP3/1nfttrbFS032+/0+G59a5MrLS33xve3/cvty7rjt866feO/vj9SPa3+bs805Mo7ZSp+zY6Jc+fxM+3Okfq2lPC7HYz7+W33tta2dU7/7mXNb1SPlMGJ8XmIL1T3X//p57BauJdI/4j4e7X+9fp7/mnOm6Zn++9nwz7Tle+uV5XNfu4X45/9/fX3N/u7o+Cmlndnbb5j7/6P1+9oncObO8fz7o2/DPtuh7WPKvkP17J+njgmPHrd1rr3nLDE+/zjD5vn39rH3Xl/ONvVIPzZ63mfOmfHLkTRNHZ/nyvN7dwjNrfT8/ZbS/dute1XDdUfajsc4nzCZ69+8939adKZ81b4OfCRPtH33AAAorpaB2Zya4wb0I2pCEuCoWuqlvfGoJb6fSm/pnFMtaVhLPChn9Hs8+vUD+6kv+mABvUI1PckEkFN0XRYdPrSsxvJTY5zO6ulaoFcW0YFW1FIvWUQ/fnytabElV7xbvf6RjH6PRr/+kbn3HCXPtO/f6AgwT+EaQ+nBWO3bZUSLLmfR4UeJvu7o8J9qiUevtuvHiyISJNcWhWtbT6aEn6rXRazW488+V24hWuPxtStdP0LPovtf0ePj6PA/rW0JXSq8aVquH2ufn8jV/726/3z1fT7iyCecotvR6PBbU3O+u8LR6x89f7V+/a3Hv3fR92fkunAE3kAHAGBW9EDkiJbiCrRPnQO04Ha7XV5ftV4/1vqg2doEfetpTpsi6peajH79ACPwBnqwZwf4aIP7Oi57lACyOFu/9RI+9KL2t4ZaLOPqJ2jL1q4XOd9AqrWuBdr287bkteFN07FdVaJ3CJj727Nxytl/fj/H4/GodiemUvdSv7l+3kYf+/pHNmr9ZCeubdKkH95Ar8SRhlajDLQkus6KDh96UeMAoMY4HaF+gvqcKZet10UApVy5QF5C9NvoLabZnLPX0cv1A/0ZtX76vO5R0+GdNOibBXQAAAD4fyZBAMpQv57Xatq1Gm8A1qnfX6RFv27f399pJwh42n5PmPu30LgnxubcMwj5tvhIjX/ryj4DUmorltd51yvX8lvBlH6Gpvb86RmiscXU//mkxf/x+KlXztcv0ekn/LZFX39a/23LFf3Px+Pxv20892wT+jtOqfVHajrMp/91/fc6jbMF4Hr5S518KJ9+ZeuffPXMOaXSP9ek0pXj57k4nw3/Vb7/WT3/GUfe8E1/G/hv+h1Jk2f/M6ezn8ObO09U+dsfbmqeabP/lU+Z/sM4W9m2nX8ej9f8d857tLf/tlX/LdXPr/++//m7Y23uvvRbvo6y/e9x+sGcsz5+3Pa3/Iyl7fq79fF/av2WPn+bpsWHA3LugOQb6AAAADsdWaACAICz3h/u0ccEgGtZQAcAAHbbfsOmvSeUoTXPHSiAtmkz+6N+rluL9+Ynzu3FG2qjfgaOsoAOgQyWIU7pjrM3FGFc2+W/7PG929N/Usdy1nb+qqd9H/GNtOj+lYnX837unbR7GnEuoPQ111Q2R6yfa3dF+7ARg8Tj14+pPa+NWOdRJ/VzfnvGT9Hbj7vfnGUBHYBh6UgB9Klk/a7NoDYWda+l/3iMRZO/pMk4ftfPY38DFqAm+s/Xurr//NnX0n/nLAvoG0q/AZQ6cFLm07Q+cE19A6OGNzhaDj/6Cfra7396/XZd+Gc6zqnXF5//2m5AtJ/rousH/SdS5Gxfe5wY6b39Li26/5+r//CZziaF9slZfnqsX3KLLm+1WUqPWspv6R10UscftbdvW/Xz1g4m2+EnHc6Cvfkionz+DvP13+rW43qff+z9+FSp/efar7+1HbQiy1uJ8EvPD7c+f9s6C+gAMJkEBdirtUm73PV79AQQTJN+Sy3ch2WttRVRpFN/1AvtqKn8peQbeQ72UVbqUPI+7KnX5QOOSN0/CAC6UdMAGoB81O/0SL6ug/vwlzTZRzr1y73ljNTvoAPblJk6lLgPR3cihT26fQN99KdIUrcA+6xEcmxtvHaO+K1Mysq5lcfRbQXX9V1OrtpCrlT+2irH21vEHZej7ozY+jXXPdgT9ivdv/787Io4zN336DpuzVLczma19+tfPvfy7+bOs/b7JUfif7ZNXru+aLVsNdqbtf7T++8+0z93HbDV79hb/xztv8z9zZX1+5lzzcUvdz/87PFn67dUtYef2n7sDf89Dr/PGbuFcZSU+upInyeiT5R3fJYmqtzVbu/bSGfOl1Imz/YNa21fah2f5IrL0htrz7Yjun7ONeZYmg8scXlH7s1W+Pf7/f//7vWHperErTnP1LZub5hzx109/1hTWV+zt/93Zu567zgnNfw10fdhrQ6Mjts05VtXWKpfSpT5ufCPHpcr/CPn2psWJdrMrbFcjn5XDfn5arnmnfbWEanrknPnSOENdKoQPdCAFPIvLFM+AADGov8HRFD3AKWoX+AatZW1bt9Apy6pT+NB7aLy79oT8FALefKcuXSrrSNJ3+Q3AM7S/4M5Z/tW15WlHG/Dngkrx7kij6d/xufjquU+1xIP8tregeSiiFSkpnGEBfQNKqY0R9OvpsLRgrNbPNWit/J1df6d2zrItsrUqrX6fbsMXXMtZyewSk8gtXQvOU4b0rfo8h0dPnCd1vp/UFZq/+prmqZ7jojMWht3lOwbljz3722PiwVzCf3zOlz5gMlnuGu0tdeLmv+F3ixtEV9Lvv+39Len4ahS3/OEK0Tk38+FdGWHWqnfz9EXAwBapf8H7Rj5DVvz4+wlLwA5bfeRx6hzal3T8AY6IfY8rVdroYE95F9YZsAJbbLLCZDKG1Tj+hkfRccCiFK6H/l+Xm3JeDwAUdbo/bda65ea4gI51Pjg7Vd0BBhPTQUAWrf0DXQAyEn/DQCgf3Ofisspok+pHwuUElW/qNfoWU1rG95ABwAAAAAo5rnYcfv//z7y72kq+f3znu1dZKppsh5og0Vsctje4eGiiDDr9t9//63/wcYNPNLByPUK/pFtM2rtAL3ifV/4+Y/tt0vTNxFYSsN9aZfegU8LP+36S28htZ3X19PvSLzOXMtc/OoqM1v3dz39ztY1udLgfr/Pnu91r/4pEo+j133+eufTf3/4f+/vVdecI8z061+3Ha+vpPDS83n0BM7f/HMkLeKvP7X9jk7/VOeuf6n/tEfO/lN6X/bc8UcmANP6V2nx2Ft/5Qhr7m+2+8/R/dfUsFPHZ2nXX3r8lXOsOO+V/+b6z6n997U45Okj7Cs/5cr63+s/FtZ6/KMnIlO36Nw6vvQWoFt5r0T4Z/Ja5Dhtb/29Fscc44f38x8Zy++pX5bPs6//vNSu7um/rKXvVvu1bX58vVephdTj+flr+rmW+X//zBPM/X50x/rvj8fjo1zUcv/nj3uVs/J99TWp5WtPvzxnuHvi9Dx/5PioVLh7lR6/nek/57z+8uOHY2GVLN+fYTwej933L3f/5ajcZe35319fX5eNz+f6bHPz/0c+e7A9flhfPyit9Pis9CcilvrZa/3v9595A70yvpvMGZ+NR12L4EBJ2g1gdOpBAFqmHRvN/eS/6Ylyz5XME1/ryvI98r2tqR4d+T6kquUeLvEN9ApdXeB8Q7ld70/ULv03sZQvriBP/ZAO8DJa+9PztQHQv6h2bKu/oH2lRaV3m8yll2/Mv6up/ogOn7HJf9dYe7v/qntwJhz541op+aP5N9Bbz2xL29pHLKK30sFsyVXfsPAGep3mBg7KGU+580BNT15GyvW5GOhBr/27WvrPAFyr1U/4PdXaP53bOvQzLX/+v874P6Xmj1rvD2le972OheWI/usVcwVr447IuYra24W9Wm//emd8WtaZT9lFp/2eT+tEx3EUqeszzS+g96KGhQ+FFsr4rKijyzr9sngMfOq5f6dNBYC85trWnvsS9Kf2vmHJ/uv8t3OvK7/qD0YXtXV77fXeldQ57bnqAcez6zMW0Cti4WM8uSr1mp6wqsnoT5hHX/9VOzCcDz/2+nsN+ypbdd4IaTCy9st3WvxK5+/Sb3DljL7+M70p3X+KfoMpun5WV5RVe/6qsX94JE6p+decQSz1U1kt7UBQov86ev5pvX4b/f6l6r187w1zSY/zrzWV9a2HGVqvn9Lnf9KuO/X41PznG+gVarUwcb3b7fbrWx9z/02s0b5BC1cz0ASmSdsKQP1q6bcemejUvtK6mufHSscr4rqj649a6lmotd5pUcvl+vOzu/z1eDxW/8lh6G+gA95ABwAAgNo9Hg9jdgAu1eIOLbzoO7SZBhbM+3D7/v5OO0Hw02ztuyceH72JQFr80xvw6OtPlXr/e7d1f6PzX5rHY/389dd18+m/9TDHK92/Vv+uftHlN7r+K3v92x3Nsvlnu35I7Qin3r/19C+/BXdqupe9/vv99+8/43u7/VM0/NZ93v+5bxlu1/Fr+WT9/m+F//X1tfi7z3jOK9t/2A4/Nax95Sfl+peucc+3wurfovlY/vtrPf1S69e5ftTvbQHT+o/pEzmp11/P23Zn0iJn/i75RsXeMM9+q3ZPGxDhyPdAU7ZYPZ8PovsP0f3PV/9r7o2s7XS9r/5d++0T61L7j+vH9XR/9s/J/BU3vm67fO45/9H+9ZlvXJerH8u2H6VF5794bd+/La3f3yP9pxrlmn9cGpdEf6IhevYdAACKqX2w1ILoNIwOH64mz3MVeY0IRx7Mg7PkKQBoR/QnQJbYwh0AgC7V1Olu3Z43j3sOH66i3qpb62+4zFG/cpW1ty/Xfg9nqd8AoG7v/cAaF9EtoBOqloLAmKLzX3T4ULPtLXpiw5+muidiUuuX1uunpfi3fl1XWZrIvir9osPfEr2F2OhqyQdnnck/v3/W9vUTq3T9qn5kzdYnKiDFdv2m/okUXdajw4/m+se+/t61fn9rj/9VDxC/P/R25JylP1FpC3cAALpX+6CkRtFpFh0+QK/Ur0Cv1G8AQC7eQAcAoFsm0dJEb6saHT5/jV6mSl//+/lL5PvST+jXHj4vEfVr7W+o1x6/2m2Xz7+/f9+uM3UHquj6ITp8XvQfASCPq/o3723253bukSygAwDQpVo63D2I/oZkdPhQg5+JhOhYjK3HdkX9ylWWFjXPbNcJe6jfAKBunwvn03R+O/cSbOEOAAAAFbMAAPTicyL08Xio4wAABja3kF6D2/f3d9oJTnzQPWcCRD+BkO6eeHzrz0CsX//2kyatX/+67etPzT/R+r5/5UXXH8IXfmT4bUt/knL09I++/tbDT/Pelz+Xh/Nd/7my1Hb63/8/+Pdrntv2O2f/Mf2e12T//Z8bxH8Vrj7PjJVz3pOlN0M/wzof5noCbm/hnjqXsO8Gnp2zKL0F/1aYS87UlXvjnzP80mm2lX/6/4RAPf2/ubTeTt/R5z9av/461fKG21lr8Y/uU4wuZ/+5//aptNHr33ra/3NaT/9Udd6/3O3nUj0XXX/WmfoAAADMMkl2vVHTfNTrBgAAYGwW0AEAgMMsrMWISHf3+seo6ZDrrTYA4Dqj9ltqIf0B2vdvdASAOj0eD509gJNGX1gYfYu57eu/KCKF7NmCt9Q9/jn3nr+JSeSobUCvqHNqKbel65et86eGX3v7sPTZtbVF9CvzRnr6aZ/W9H791C21/1S6flY+aFGJz6l+Mn+4bG/6l04/4Y9dv5cuo3vql97TmH5ZQAd+qX1SDwCo31Xfw7oq/L3hRYUPud1ut93lzsQ5AIzH/CG0I3p8Gh0+nGUBvXLRbzD1/oRW9PXV1tk8Ozm9pPYnvFsPP/r4VMIfvX69KCKF1FZ/fyr9Bk/tyl9/3ekTVb/MhZtjYS0lP54J/2j+Wfv7EguL7+crUVa3Jjd673/M+Z3mOWNzvT1vln/+7v2YpfxhUiyP1ncw2NJ6/GlbdP5LDb/2N/BHPz5a9MOjqX9f+/3de73Ri5NR56+x//5b3Hh0j/L9v9/jx9zj46Pnqm23ttrrd9Kk3l/fQAemaYofTAIA7dpaRC5x3ivPkXLuK/tYuSc3RtT7dS/tlrDGN9ABoA1XtM/6AMukDS2IzqfR4cMRFtABDRcAUNSZvkbti8FHzmkysy29p2Wu6+s9nQCA37T90IfoshwdPuyVvIX7ni0mPv9mbiu4s2rfQmXJa2ud4IjslDv9tq7/qu0ot7bAzLEF0tK11JYn56Re/9bxZ7cGPRp+lPfwc9Z7n+dcC/fM8an2X+Pf8HPEaS7d5/+mbPjb9+d2WZilbdWvc3/butJbKG85W7/uPb5Wa/2HK98yjkq2lP7TkXu9px7NHebS8Ue2W9v627397+14v8pPiTb37CcEcpXn1PotV//xrNTwU9+2XtuWsNQnDeZ+dqR92HP88//j+4/bUvogtfZTWm23n/aOhc7UP3vS5Hmu1P4TaaLr9xb9vtZzW9AeKUup81cp9yY1/Fzjz6jx+dn8vdaur53ryCdd9vxd6fFpqeP3tg979dq+RMe/pk/cRG/3n2tnqCPhl5jfuzJPReffXpX8VF1NfAMdAIDmlXhQ6f3ctS6qlFLL4GXpO8sAANSjlr4j+0Q/EA6tia7josOHUVlABwCgKWtvcZZa7K59Ef2Ktzef4UQO3n/Crvc+AJR05A1u+nP2jVHYa66/m2tHxr1vkcvnZaw9lCqNYV30+Dg1/IqnMaB6FtABAPilpi3StuIwF9dcW+8tT+DFX//TVfeihnsOALxEP9RGn94XsXPlryN5tUT4/FVy964eRY+Po8Pnr+g0jw4fRmEBHQAAZoz01nnNavkGPQDACKIXrqPDBwCYJgvo1dNpBAD466o+Uo1vZyzFpeTbOhHpUFOaQy+8wQT9MF9EK+TV+mjvIU30PEF0+DAKC+gAADQl4htkI72NvvWN+au8h1Vz2gNcxSLU2Nx/WiPP1mOtL+1zELAueny8Ff72WFn5hrMsoAMA0LyRF1hLXHtt3578HY9x7zUAQI0swrZl5LETnBE9Po4OH0Z1+/7+TjrB19fX//77vfG9YgvJd1sNv8plXu3pVrpxiL7+0cN/d2VH4BnWXJglwo9K5/Lh3g+F//cbtv8UiNNyeCXDirGe/tu+tv+kYvGDh/X0v99/fr9Uvzwetz8/yxn+ttT7f6z8f5or/znCvypfpNcv59L/dX1/+9xbfsdpPfztc/5O/7/1+1b+Tst/j8e+8UupNuWq/sOeuKwpl/6p+f+Vf+bSMnVCd8+9WArjyn7oku0t1sduP0qHv+V2+2c1/xytP+fOMWepni1p/lq+dof/fvzr7+vsP/zvtxv9t1Tx8xtl02/Ls/46673/8zrnXD47Zv/8QJ76p/9x6jnx5SMt/9R4/FL5WEuLo/HI1T6dTYf4eYG9yva/z9qfbqn1f5m+9/50WU//7f73sfWznuc/96T559+8rx+eU/f4pXz4RCr2BvrV21zWvq0m89wzol3RyVY//ZAOjKb+QTzkMWL9rnyPy8IH1Gu7fG6fQxkem/kBSnPvqUV0excdfkmj1/OjXz99Kfr4w9UVYc8VL5Bf1HdcRyYdGIW8zmh6z/NRb5tDax6Px+o/UDP1e3ty3jPzA5T02Q5e0T7KZyyJzhvR4V+hx2s8Ulf1eP2MKfkN9NoGwZ5wOWb0yiz6+qPD568cW8AtidiZI9Iz/IgtJ68MB/b6XRbi8ufP9wm3/2ZN7cWr9Bui21u8tZ1+W6Lr9yhL1z33s57TovS1pZYv6tb7/dsuH/3WDZ96qQePjA97z98pftKmTJ5Ya5/n/u6I3/f/8OGrzF9ea0/5jXiIonQeaKEuVg6uFZ0nrvrc77vSWSx6fBx5T9c+DxGd17hG+ifKys7fpbYxxbZwj3RVJ4R0BqCMZsT6ycQA1EE5JDf1+7J2vsfIUe7put4fIOKcV51YNpzt8qnNupp+wroR5wdqVrL/tvSN8pH7FfL9taLzWnT4V+h5fDx3XZ/3tOfrZ1xFFtDXnjy5kkILrImsq0arn0pMDPgGKTWrpS9UUxxaon7Zr8eJ363J0yPle/SJUcaTuoBZyxtElLH1ZlJ0+m/V7z21dVfInV6lH05L7b+nPEDUw/xAdP8555uPV/Xfct731h7ebC2/R+fvLdHhb6k9fjn1PD7eo8frJ01qXojOS1m2cB+pEiSv6AIAS9RtZfQwMQCp9myhnjs8KK3H+v1MX2DuGH2KvtQ+gQo1+6wPc9ePJXdAUJcfU7JPEHEvru6/c1zu+qVkPuutfBzV25gB5vQ4Pn63Vc/0fv2M4yvHSRQGoCfqNKCUq+sX9RlcZ628KYvACPbUgy3Why3GOVJv6dXb9fSs1K4Huc71/GftZ70b6VoBaF/yG+hL33CpRe1P3bHO/SurpvS9Mi5b28lcFZea0v8q72meev0jph8vtd//rfpFPVNGru3Cak+3s9uK7r2us1swf6b/cjnYFY1Fpe/P9hbS+g+5RFzL3gcdak3nWuKVc8wfMQ44ayv/XLG1dEml2s/b7bbYRufcdni7/r7PxuGzf3bk90thlpgXa22L5txKl6/62/fUd6Duicevix7ff32lpc/Z8FP61znrvT2fFSph7zWU2sGnnvLZd/i1quX+p372o/b7W3v55Dp7PnF09L6v7VZwdieDnJ/VzPIGOgAAUC+D11jSn97I08AS9QMAwHh67AMmv4EOAHv5Bg7A9XocxLRE+tOrFvt1vmHPNP3Ou+55GS3WD9ADdRoAEaJ24ird37SATigdOyLJfzGkOyNoPZ+f3cJ7//FljR7+u4i41HT9JRwZwPWeFiWUHgCnDsCjt6itzWiLZL3dv0/b5eOiiBSytnDe+72N0Fr9UL5+byctaE/tdVjt8aNv0Z8Amyb5n36tfcJpmur63PcZFtABAKAzJqliSX9G0svkCGOYW9RVZ5ejfgAAGEtPfWsL6AAUYVtEgBjq3VjSP430a9cVb5tGb+EHNau5/vyJW2r86t4BCWqkXQTgKj32xSygA1DU4/HosgEFAKAt+qRMk2+gA2OweA7AVUr1qaPbsq/Q0AEAAAAAAACgErfv7++0Exx4suDMt49Sn1yo/6nie+Lxqc9ARIcfLfr6U8OPFn3/3b80pe/fVvpEp7/wY8OP1nr9lSr6/keHz5z6+83rIuI/N65pNf0gh62xfunysT3X8Lf9eY/T2s5JP7+LeQMitX47883v+frtn1Ph5/J4fP9/PI6lw97rv9/vf35/JKyz+f/xePzKe8thrvef3sMvU9bK9v+20+/v75/H7Eu/9XC3jxt9/NCn6P7vmfq5Rrnaqej7EJf+pcfH6q8Rxefrp+j5n9bDj5VzfPd+rrX8udZnPnp86hvsbd89AAAAAMggapI5fnK7bdIPAKAdqX23q/p+wyygR++VDwAAAECaUvM7vSzC9nIdAAD0a8+b5meOz+nf4iEkyjkwqmfbCgAAKGNtC+Irjo8WHf+U8KPjDltSx+epWwBGPxhfOv57jm+5jmhxfqf8tug/582RNrXnjejymyo6/pXf3nCj93+3lPzEyp6yEV1+1tQct17U/omfK8LvuX5hbKl16FY/OLqOHuYN9HfRiQ4AACU9v6cadXy06PgfDT86vlCLmidPaqG++K2ltFiLq4n1c2632//+gdH7v1drPb1ajz9tkd9g2Vw/rpbykvwGeitPiH/Gs5W30befkOo7/NKin0CLFn39whd+SvjR8U/VevxZl9p+li8fqeGXPT5VdPmqqX6LeBun9eu/Ovzo8dJR0fd39ONTlQ4/R36fKze5tvFrrLitGvFtptLzO+/Hl6qbI+5bxNv68+rOr63Hv3XR/b+cx4+gtf7rp6Pxjx6fp4ruf6aKjn90/RQ9/og+PlV0+KW1eH1747R0bVf02Z+GeQO99YYdAADOKL3lcu2i4++NWjjuvWwoJ8tGTZuI6241rVuNN6Qavf9bUutp03r8aZ88yEhSH4SOLi/DLKBPU3xiAwBAhNEnEaPjPxd+dJyAPoxal1x53bnCGvVe5SL9OGr0/m8JradJ6/GnH/IiI2m5Pf53bduIrQ+47/V5/uf/X3Hhc9dWw7YFr2tfTv/39Ina4qtU+LVsoR8dfvQWG9HX/1Qqv0Xns63wS8WrnusuH1YtefjdVvq/8vtt9e9yhkkZe7YS2jr2bP2w5/iU+G2Hf999rpzW6pe1txVztytb5z27xeyZvvGRY/bmu6Vz7q1rSm0BnboIfVVduVT+PsddW2Oto2OBEtc3d86t+iW1fpr7Xe7w1+xNx6X6ILpNTg3/SPrlGM+v1atXTZTsLWs/+eu6uJw5Lud2iLnKytL5z1xrrvmdPe35XFqkbvlbuv0sfc7UfkSq1PRLjVfEJ1l+h1n3Ykvpbc/n8t/zZ2thrx1XypkwS88Ppf7d3v7X2bQtUVd9nr/s+Dhm/m+viPnHnOPz1H5tTlvXuveYnOFv/W2p9i/1zeJU+8PP9w7x1lzP37DLl/2r1o9S6/ez+ehMmcsp+RvoABAhegAC1GWpU6+uAKhXrof2oUaj5u9Rr3t0Pfa5e7ym3ql76tHb+HzrIcvI8EcnbShpqC3cGdfj8fj1D3U58qYDrFHOYQxrZbyWNiXXW3JAnWqpa3og/ehZ7rcqWxnvKNdMU9vjc3m4LUv57Ha7uZcXaGF8nmIt3lE7LF8ZPozMG+h0b88WmlFqiEOktW02Pb1XXs/XX0sZh1FdUf7WtouL3jpvbdtXdRO0bav/Gv2JptrV/jaSSUhSXJ2/ax/ztPYmes1p2bra8+qnluLaiog0dR+v1cr4PJfo9u1I+MoCNYv4RM4R3kAHQnlDD4ArRE/aaNugH/qv6aQXPZO/X7z9SUvkV7iOsga0wBvodG/uqWeNNPRNGYf+7S3n6gOAOi29rduz2t+wIJ8r8ndLfZyfeZnoWBClhbzaQhw5prWdD1o32vg8uh8bHT6MwgI6Q+ilce7V2laYcIT8A2PY+w2wGr+BboALfdB/zUfdSM9y5m91Da2RZ7nK0mKivto1Whifp1h7GOOqz9dFb4MPo7KADkCTPE0MvLP4AgAAMYzPqYGH8urR231Yexhj61pz1I0eBlm2nf4XRYQu3b6/v9NO0GAOPBLn0pXT3sakXPiv+38ujK98kTnlnnR0evqnXn9a/MuLvr+pak/faK3fX4jUev3Se/tV1hUD5PVw1+/f9hbBf/t/Oa/pbP957yd3It5i2NNnPBOXufO2OL66UlT522ttAcHiwjHRY+V3Z+q1mrbujp50zZ0We67jTP2ao31ZutY8ad/m+O2VJuf6j6+0K9t/3S4n8+Hvz9/Hrz9vmR27//94rKdl6frxvf8dE35am3q/3//8vqU+Tevxj6//6y7/tY4PfFL2Kbr9iS4/fTjbn0/N92fCfQ8zdRwi9wAAAAAAALNaX/xrPf4AXM8COtM06UQAANCWK/uve9927G2rQoARmR8B+K31erH1+AMQwzfQgx3ZQiwifAAAfqu9/9T7Im5U+n+G23s6U0atW0wCdZe/n09ARMeCFNHzf6OLLt/R4ZcQ8VmlnFqPPy/uH1CKBXQAgMtFfwMKSHW73Ux2A1CUdgYAAGIMv4BuMDLvmS6e4AIAoAW5+q9nzzNK/zn1DerW38BuffzYevr3zhuqdYqq33u73/I3tOu9/LZYVluPP0Cvaq+TfQOdP2rPtAAA8K5E/3XPOZ+TcfrPAH2Kqt+1K0ArWq+vWo8/AOVYQAcAAACACljMAVrRen3VevwBKOv2/f2ddoICW1jVtK1K/1vYpX5DNfoZjOhvwPb+Ddvo+5uq9vSN1vr9hUjR7eff8N/7TNv9l97brz697nHZ+3em/3ss/+U/Hq7S+hb20eFvSR3/R8d/zpFrqjH+OdWe/+rX+vitvv5zTeGXLx/R6RctuvzUnX6jfIqoXfIvLYtuf6LLTz/2jmtKtSXv4X+2W0thpo4vh/8GOgBAD2wlDQD10T4DAACc9zmWuuqBr+YX0FOf8AcAaM3j8VjsA3lrgAi32y2p3516PEANttpn9RwAAMA+S+Onqx5Sbn4BHQBgPF/T4/GzjZUFc2qRmhflZaap/i2eo8NPVXv8a4/fHmvb4PZwfUAZ6gcAgN/mxlZX9pl8AAAAAAAAAAAApgbeQC/9NIEnPAGAFunDEGXt7corjqdv8gWtk4eXSRsAAGCvufHD2mezcqt+AX2Lb4gBAKP56SjO94Gu7EgyttS8Jq8CvVmr09R5AAAA+y196/yqdeHmF9ABAMZz//MTDxUCQH20zwAAAOfdbrdf46qrdjascgG99ACzrqe+/06AH5P6Gfv9x9e53Wbq9a+r85rflb3+9kkf6FX99fPLVXE9cv7H4/vwMXWJrt9T+295w//sO8/d198/m7/ve/vgqfnmdvsn6fj49GdNdP28Hf719cd72brdouuv0eWrP1IncGLKyiv/nQv/uvp3rU1aivPvsja/3ePa8ff7/c/vf//tcvndt8PAevpthR9dv7YuPf2i5+/OeZWL7//9bOltrk978/8+baZfPtHxL1t/19j/OsInqrZEl//W1Z3/6yf9Ip1Zqz1yzOfC+Ofvlv5/b18mldwHAAANu91u//sHgOupf/tx9l7mygPyEgAA1CH5DfStzr3tygAAIJ/P/vfWG3dArLWn6umH+rce0YvgZ0WHDwAAvFS5hTsv29spXRQR4FL7tgAEKOPYdo5Eu2rrKvbRhjNHnuiD9jFN6fqxxLl/P6SW/fSHwl/6BAt5pJZv83eMqvUxSOvxb0F0/yk6fKBdFtABKqLjDgDt6/87iADntFw/2vEFrtFyPTGS1uevWo8/AOVZQN/gCSXgKjrvQC/0n66l/fitpvzX49vo0fmtlfCX7ntN+ZM83LNzrqwfz5TbiLomOvxo3uBmmn7ngx77Ub1ovY5qPf6jie4/R4cPxEleQNfgAKRTlwKw11qbYaKxPu7JmNz3PrmveV2RnrnGWT9xzXKqJsOHK8yVV/VufVqfv2o9/gBc5ys6AgCj03kHIMXj8fjfP9TJvYF+KM95tZCezzhGxbWFNALG0Hp91Hr8AbjW7fv7O+0EB54CfP5tTY1V/FOM98TjPQPRNvcfoE3R9fff8I98l/N+v//5u7ltQ8/2k8pvcRbd/qXe/3OO9qHj+7lL8uf/K8yVi89tRj9/P6fe+7JP+1sYRtcfxIqpP+rRZv17le367Z/EEKL7j9Gir389/NT2rXz+OecVr33pv3yd0fVH6/k/WnT97f6NLTb/xY9f5H/ad3ZNd26eZM/nzo4ctyf8s3wDHQCgA0cfVKx/kQvqd7vdkh84ac0o1wkAAACkOTOH8D7XEskCOgBAY9a+BbinY2oBDPL5LE81DPIAAAAAIqXMP6a+fZ6DBXQAgAblfuvVoh+12N5i76KInOQBFaCU+C1IoV+p5Uf5A6iT+hnqcmT+Mbr8+gADAAAAAAAAAEzeQAcAaFKubZBKvHke/YQobdvOP3ZLAMakfQUAAFpxZv5xz5gn966cS7yBDgDQmLUOYuqCuK3cYd3j8fj1DwAAAAD7nZ1TuXIexhvoAAAdyNGBtBgI2z6fdH48HkO9FeobzAAAAMBZ7/MKNc+p3L6/v9NOUOmF7RUdfxNQAEBv9G/KGj19o68/OvzSUh+kaf36AehT7+33ltGvf3TuPwBn1D4/sLWV+3v831+CWPN+Llu4AwAAAAAAAMBkAR0AAAAAAAAApmnq4BvorW8x03r8AQA+6d+UNXr6Rl9/dPil9X59AIxp9PZt9OsfnfsPwBlb7UfqFu+1f2LEG+gAAAAAAAAAMFlABwAAAAAAAIBpmiygAwAAAAAAAMA0TRbQAQAAAAAAAGCapmn6NzoCZ0R/OB4AAAAAAABgRLnWas+e58hxj8dj9fi533sDHQAAAAAAAAAmC+gAAAAAAAAAME2TBXQAAAAAAAAAmKbJAjoAAAAAAAAATNNkAR0AAAAAAAAApmmygA4AAAAAAAAA0zRZQAcAAAAAAACAaZqm6d/oCJzxeDz+99+32y0wJsve4/j0jOuR+D//Nvd1ljpv7vOXjmft4cOatXqG+p2tX1LrpVrqteh4RLev0defaq7+edfqdW3Zuu6n2vtXe8N5dyTM1vP36K68f/JKP1q5l9HxTO3/PdWezke13n+qNV4wglbmN8+EeUTr86/AstbL5+PxWIz72u/OhjVN5+YvlrSa7k9n2pQIa/Fcyz9bfzN3nvfjttLHG+gAAAAAAAAAMFlAB4BQrTwJCAAAAABcz/whXK/JLdzfRVccubbIibIn/JRrjLy+6LQlXeo9jNji9srwqduR/Nv6dkyfrqh/a6/jS8dP/bgdfmR5quH66dfo9ze6fKWKrp+gVS3Ufa3XTylaGM+Unv+ib7Xnn5rryBxxW0vbEfpWI1zjmt7b157nD2uum3ohjctqfgGd8lTMQO1aq6eWtD4oKlX/9nJ/uZZ8wx7yCRHkO9jP+L5un/en9fqt9fgTS5FafWkAABHVSURBVP75rdaHylu9T63GmzJqnz/Uf6MXFtDZrfaKeZpUzq1xv8jhPR9dWU+l5t+lwU+rg6LSi+fP/24tXYjXY76Jbj+jw8+l1faDfvRYP0FO6su6rd2f1uu31uNPLPmn/sXz53+3eJ9ajfca7f261uYPj97P3ncYoG2+gc4hNTdoNccNKGOu3LdWF7QW3zlXLJ6XDou+yTd8Ur9QC/kO5ikbddtzf1q/h63Hn1gj558WFs9TzxWt1XiTpoX73kIc4QgL6BxWY0VYY5wA9mq5Dms57oxFXgVqpX6C35SJup35VmurWo8/sUbMP7UunvdIWoyp5vtec9zgrNv393faCRrfQuE9/mcK+dnrPxpWjnQuUYnVfv2p19x6/m6dLVyIcHQLpFIdxFbz9970iL6+nFtd7XmS/TOc1HC30jk6/DnR9zyHXOU9Iv1rEpUXWqmfltSS/0pbus7a40191sqM/FSXuX7Z5za777+v9f4Zv9bN/eGMq+dva+rnH7mWz3hvjUfXwppLg63j9R/bluMTibfbbXaL8/ct7+UH+KumdmfO3DghpX369DzX+9+9n9830BmahhNIdbvdqu9sECuqrdHGUcrZCSw4S30GY2ulv62uAvhRQ72tTgboQ2R9bgEdABLVMDisjcHqj1oWz90PeFEe2uJ+AdOkLgBoTeQ8iTZjLO9vkH6+TSovQNuiy7AFdLoWXcBI4/7RkqODQ/m7b0v39+r7Lp8RQb4jF3kJxuKBVErSpkA5c1vgvv/8yvKnrPfnyA5o+hLQv6Xt1kuwgA4AmSwNGmGaDOQB9lJfAgC0x1vnAPTEAjqrdD6AKFuDrprrJ1u6865EXt37BLZtyzhDfmlb6/ev9fgDeb3XCfrXAPWLeLFA/3Fsa3Nw5uf61/L8MduixwIW0AGA7HRgf0Rd5/u3v57//26U9Ic56ieAOn32XwBol4VLrvTMb+8vEehTQN+uGDtYQGdoJlAB6NWV3wRiLPpPAJTS8iK69hEAAMq76gGt2/f39/4/1tmfpilPOqTcYPchn94XF45s3WubX7jGKGXNBGKs0um/df65fN7DPc/VQS+d/lth5softT7hf7aezVU/X1nPz93LvZ94WFLLfazVKO14q/bWj+7fMVftZNP7+Bx6ltr/err6+LPhfIruPx6J35n+I2n0H2NJ/7L0v9OtfYKg9PEt7RQS8YmQr8tCAgBgCHOLqS11ygEAAACAcTW/hXvqGxYwTZ6AAoCclp4K9eR3P+buZcvb7gJQD20JAPTDDlgQx/pomuYX0GHJnsqh9QZ69ApQBwzqpfzFuaJt2Ht/b7fbr/hYQK9DyS3kcyyiR/dvSocf/YkF6JkH7Numf1CW8XNZ0rdvtd+/2uNH29RvYxu5/+wlASyg051WK3WLCgCkaLX9AwAAAPpkAZ7W9DS/pvylsYBOVz4rhLMVwN7F7FwV0OfbeSqua2hAoF6jl8+j119r5z5Xu5wa7qfa80+t93PO0nb9a1q6vhGl3p+r+s/AODxsvk9q/a1+Zo3+WxrpR8+0H30bbYen3q5H+UvT/AJ6bxma83Llhavz1Fx4FtEB2KvGvtBSnLRtfXj2U97v53O7fn0YAHKqsZ8DAEB/9Dv59BUdAchB5QbAiGpt/54Lqe8sqgIAAABQm1rn14h1u9/vi5nj8w2SiInPrcnXM3F6P+f78XsLSY50OFogTTrP37eRtnIb6VqhZcoqV7uy//Ie5tL5en4DeW9al+i/boUVleZHws/1iZy9rkiTz8/w7An3ynt1pn643+//+/+5sVKv5RtgJBH9RxiZfhTQqhILy+rCfM7MyfTuyJrvczfFpd819Qa6ggUAQEv0X8fhXgMAAAD0oZkF9JwTUia3AAAorXSfc+7t5ytFh18j4wwAAJboMwNAO/6NjsCWpUmozy28zx5PO0a/Z6NfP7Sm522sYS1vy/f6n6mu2uL9rLPjDwAAsJ070JLax+dQUjNvoL/TweDxeKicgeqpq4Cn3P3XubrlyvomOnwAAGiZvjM1Mo8F8FL9G+jvzkw8eqqPlq29wertVmiH8krP9LXWlUiXua3T33dnitg6/kj4Pb7BfWWce0w/AICeLY2ZjKWoyec4T74ERtfMG+ipFbYnpwCIpB2C8fgGep9GulYAAPLRj6RWdhgD+KuZBXTGtNZQa8SB1qi3APqgPgcA4Az9SABow+37+zvtBBnfrHnf+vGqMAEY01xbo32hF/pS0K/USVflHwAAgJ71/omM5/XNXef7f2+lQ+mHulI/8bd2jqVj567/iPfjvYEOAAAAAAAA0JBeHxKowb/REQAAAIA97LABAAAAxr+ldb+AboIFYEy+K8bI9G+gX8o3AACMI3V9w/oIjOXInHhq+e99/r37BXQAAAD6YAIQAAAAKK37BXQTKAAAAH0wvgMAYCSp/V/9Z+jXe/nu/W3wCF/REQAAAAAAAAAgnQX1dBbQAQAAAAAAABpn8TyP2/f3d9oJdmwBsvQ3j8dj8/i5G23bEQCWHO0gaFMAoG3vbb92HQAAgBFszYPXOj7eO3+/d/14bQ166/xLf3O73byBDgAAAAAAAADTZAt3AAAAGlbrU/UAAABAm/6NjoC9+AEAAEhhER0AAIAjWt0CfRTR68feQAcAAAAAAACAyQI6AAAAjXg8HuFPoQMAAAB9s4AOAABAUyyiAwAAAKVYQAcAAAAAAACAaZpu/92/k07wNd1Wf//+ZsDttv63o3umz9G3KZbS1VsZ9O4978vvAABAL87OD8CS1Dk5eREA4DfrE2Vt9V+faX62n7t1vDfQAQAAAAAAAGCygN6FuSdbPO0CAAAAAAAAcMy/0REAAAAAAMrxogUAAOznDfROvA+EDIoAAAAAAAAAjvMGeuMej8f/PnD/uXD+/jsAgFxSH9bTP6FlW/lf/gYAAABomzfQO+Ab6AAAAAAAAADpLKADAAAAAAAAwDRNt//u39M0Lb+xvLUF4ddki0IAoIzP/omtkeuydH/ef+6etcE965v7C8AZ722GnQ4BAOKdXcudO37tM9A1zR3kiMtaX3bp/N5ABwAAAAAAAIDJAjoAAAAAAAAATNNkAR0AAAAAAAAApmmygA4AAAAAAAAA0zRN07/REaBtj8dj9fe32+2imAAAAAAAAACk8QY6AAAAAAAAAEzT9HX7/xeIz/z7tv7yMQAAAAAAAAA043b/73t63H4Ww+f+/fi+T9PXbfqabr9+Pt0f0316NL9Fd6vxf4/30jbqj0f6/TmyRfvW30b6TIdnXLfiv5V+R7ewf//7HPdny9fX12Icn2Gv/f5+v6+ev5Xy83mNW9f++Xd7z1ub1uNfWun0WSt/n+W/xL1Ird+2tJ5/St//pXpmb7pvhb9Vv2/V36Nbug9724cW24+cdU7u/tFROeMfUf+m+vr6Wj13dP0cnf+36sfU8l3aVvrd7/dff3MkvR+Px/TPP//s/vszvz/jyjHllfXXkf7X3vZndJ/pdLRPXer+7Q1/S2o+2Op/rs1B7KkfSztavx11dkyUq3+4du49ouvf2ud/SqfPUZ/t77P/9vm7HGEtnbMne+c3zs7/fYbx+fPW0ze1fm39+qPHr1uiw09Vuv+1JXp9auv6tuqh0vOPa3XYVfOHKfVrrvx/9jz/TtPG2+a32zQ9pmm6/f75Y5p+FtXPx5kdlgY4cwvAJdReQbfsirT97LC/h/tZOW39HoB6HKnf+WurfwU1W8un8nD/9WPKGKKHCeDWaX9gWfT8k/JJKdF5G+RBiBM9fu99fFzav9ERYNtVi+WUpUICWqLOonf6V/REnT2utTdK5Ys6aX9gnyt27ZsLc5qUT9Jof6ldRP0KvGgn2vG1/Sc/5p5U4FrSvV3R926r/CrfAG1Sf6eTbrROHp43Uv241b///PnaP1xHesO2qHKifHKWvEMr5FWIUUPfRvnfb/MN9Pdt3ub20X90vol76h78uffwP/qEWG3xb01qZbL2fYkc5z8bh/d8tPX7o+d+13r+0Jj0bfT76/rrebAp5zk8SX7O0W+o7jkf50m//WpMqxritFY/1hC/FFufYzp63GhK1++lx/ekKT0/Qpqz9VspV5fP2vNXrm+0nj1/7XXl1vwfRKqtfr1adP8vOvxUrce/JjUsnr//bKS0P2vXFu5zEw0S9xpzGfn9XkRXkPLBcVEDsK1vXPgGBkA7fMMozVb/Cmq29Q210fvno9SPRx4GeM8To+ePaNHje2hB1MNOyie5yTPUpoeHSaE10eP3UcbHpfgGegMiv8Gks5eX9ARa4Q0ceucbl/REnTymPZOg6rj6aH9gW+Qi+jN8SCEPUSuL6BBPGWzH7m+gT9Pre2nAPrWUl61vXPgGBkCb1N8A80asH/eM12+32+o/ADUapR6nXfIorZJ3YQwjjo9zuN3/+/7f/5xJuEejY+y5yYG56y85idDDE19n4793m4jPNMrxKYGj3zhdCuN2u033+7348WvnK/0Nqmf89m5jdvR+rJWBrSe/t/LG3vDXbJ3z6+trcxuWkuHPnetI/sjxDZu5ydbn5G1q/Xk2r6duQ5Ny/Gd52MrfuaWGf+SelbiGM/f8Pe9/1k1H4vhZn3x9fc3+bm/4S+f+PC41/FblbMvmznOm/hlhi86z+fXTWvu3p7xs2aqjjravn+Xriv5jbqnhvx9/v98P99/eF2ZLl4/PvsUz3KPXffYzDUvXuff6t47//N3V9U3O/ufRNN0TfkRZW4pTifFF69bq0D19r9TjU22F//ybvceeaV9yjG/P9H/nyuHR46M+R/eUOj+UOtYpfXyPff5pSu//7T3PVv8xJX+fGVsemaM5Ov+1do4le/rvKfXj2nGpf3+mfj6qdPv2/JulY9//7kz4R5zpv73PT5QI/2w9sdXfT5nfK3H9Z+O3Vn5T6occ7frZ8I+2qbnrx6vDj6xf5o79HN8vlaWluf/U8I+YGztfOU77Vfp7H+xtKXH9z8w4d1N77RyXNHoejTCX5nMDgREtleulMn9FXK4Mf2uACZFSymd0/o0OH3qmfLWRBtHjpLX+b+rxLaQ/P9wrjpBfrifNycn8LVCruTnfsw8Znw1f/ciofAN9Q85J9iNP3pcIv0Zn3wBSOeeROx2vfio9Va7rP3ueEuk/Te3XC7UY9Q2B3uy5T9H3Mjr8XqQ8iZrjeOrkfm777L8t9ef0wcuo4a3O0tSv9Eh+rsNIbZPx6XXOzN9SN+XjuPf+W+/rE3Nqu/6lxeur01792B7j+zR/FtBHH9zmvv6lSsVC1z4ltxhh29oWGWtbMY1yf7aevItKh6vrl/d7PmrbQX32ls/oPBsdfqvWtkI8un3qmeNpg/K135FF9Kg4XTXAP9P/TT2+p/5zb/VrLf0F6iI/xDA/REnmbxlZL/239/HC2d2jarz+9zh9Xt8V4wj1Y/tqGN+36t+lAeHegWLqE5DRT1CmXv/orr5/Rwv16Pcv1/1ZmrxcKie1NKDR9VP08an23L+lLYOOHFtKdPqlEv+yoifgosPvSeqi2pnjo/N3dPjRzl6//v2Prf7b+/+/bzt+pt84Z+s8nw/mffY9r7p/qYv3rfafc2rxrQbzA6zRvtTls76U/mWN3v+EUbTaf1vqSx+9nojrV79yhbPj+9H97xvot9vyx+BHUOr6n+edq7xHTu8zpFeMPU8njXpv1sr2FWlSQz3i6TVqdaZ8Rufd6PBblpp20r5/7vFfa29DH/n7EqLf/Ejt3+g/v7R6nTX0s2mDfBJDupOb+Vt4aTHP55yfrO36Px/M/fz/K8JXP7arhvF9y3wDfUPOjHTmXL1n5L1PWC1NOHlSJk3OJ9xafHIpV/l6P8/RNMsZfmvpXztPgPZhb/mMbm+jw+9Bal2oLu2X8rVsqf/mO2nXiEjPiG84ql/plfYlxqjzQ8an11G2+6P8HPe5I9Roarv+uXFDRLxqSAuOM74/7+vzB6MXgtzXv/a22+hpfZZ0u07KE24jVL5L5frqN9Dft1+J8ng8hrjntGOrfEbn1+jwW5e6k0DNOxGQTvk6r+a0u6pspr7hMXr/ubf6tcU4U04PZbQ3yii5mL9lZL31346q/frf530j5oLVj4zs/wDvuBzCxf1k6AAAAABJRU5ErkJggg==";
const LOGO_WHITE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB9AAAAfQCAYAAACaOMR5AAABCGlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGA8wQAELAYMDLl5JUVB7k4KEZFRCuwPGBiBEAwSk4sLGHADoKpv1yBqL+viUYcLcKakFicD6Q9ArFIEtBxopAiQLZIOYWuA2EkQtg2IXV5SUAJkB4DYRSFBzkB2CpCtkY7ETkJiJxcUgdT3ANk2uTmlyQh3M/Ck5oUGA2kOIJZhKGYIYnBncAL5H6IkfxEDg8VXBgbmCQixpJkMDNtbGRgkbiHEVBYwMPC3MDBsO48QQ4RJQWJRIliIBYiZ0tIYGD4tZ2DgjWRgEL7AwMAVDQsIHG5TALvNnSEfCNMZchhSgSKeDHkMyQx6QJYRgwGDIYMZAKbWPz9HbOBQAABrrUlEQVR4nOzd3W5TSQJG0Z0R7//KmZvJCHCZxPb5qTpeS0LqRhhXHG6a3V+dj8/PzwAAAAAAAADg3f3n7AMAAAAAAAAAwAwEdAAAAAAAAABIQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAA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AJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAAAAAAJWADgAAAAAAAACVgA4AAAAAAAAAlYAOAAAAwP9rzw4EAAAAAATtT71IaQQAAEAl0AEAAAAAAACgEugAAAAAAAAAUAl0AAAAAAAAAKgEOgAAAAAAAABUAh0AAAAAAAAAKoEOAAAAAAAAAJVABwAAAAAAAIBKoAMAAAAAAABAJdABAAAAAAAAoBLoAAAAAAAAAFAJdAAAAAAAAACoBDoAAAAAAAAAVAIdAAAAAAAAACqBDgAAAAAAAACVQAcAAAAAAACASqADAAAAAAAAQCXQAQAAAAAAAKAS6AAAAAAAAABQCXQAAAAAAAAAqAQ6AAAAAAAAAFQCHQAAAAAAAAAqgQ4AAAAAAAAAlUAHAAAAAAAAgEqgAwAAAAAAAEAl0AEAAAAAAACgEugAAAAAAAAAUAl0AAAAAAAAAKgEOgAAAAAAAABUAh0AAAAAAAAAKoEOAAAAAAAAAJVABwAAAAAAAIBKoAMAAAAAAABAJdABAAAAAAAAoBLoAAAAAAAAAFAJdAAAAAAAAACoBDoAAAAAAAAAVAIdAAAAAAAAACqBDgAAAAAAAACVQAcAAAAAAACASqADAAAAAAAAQCXQAQAAAAAAAKAS6AAAAAAAAABQCXQAAAAAAAAAqAQ6AAAAAAAAAFQCHQAAAAAAAAAqgQ4AAAAAAAAAlUAHAAAAAAAAgEqgAwAAAAAAAEAl0AEAAAAAAACgEugAAAAAAAAAUAl0AAAAAAAAAKgEOgAAAAAAAABUAh0AAAAAAAAAKoEOAAAAAAAAAJVABwAAAAAAAIBKoAMAAAAAAABAJdABAAAAAAAAoBLoAAAAAAAAAFAJdAAAAAAAAACoBDoAAAAAAAAAVAIdAAAAAAAAACqBDgAAAAAAAACVQAcAAAAAAACASqADAAAAAAAAQCXQAQAAAAAAAKAS6AAAAAAAAABQCXQAAAAAAAAAqAQ6AAAAAAAAAFQCHQAAAAAAAAAqgQ4AAAAAAAAAlUAHAAAAAAAAgEqgAwAAAAAAAEAl0AEAAAAAAACgEugAAAAAAAAAUAl0AAAAAAAAAKgEOgAAAAAAAABUAh0AAAAAAAAAKoEOAAAAAAAAAJVABwAAAAAAAIBKoAMAAAAAAABAJdABAAAAAAAAoBLoAAAAAAAAAFAJdAAAAAAAAACoBDoAAAAAAAAAVDU94DxCil2eRwAAAABJRU5ErkJggg==";

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("matin");
  const [user, setUser] = useState(() => sbGetUser());
  const [authPage, setAuthPage] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [darkMode, setDarkMode] = useLocalStorage("pm_dark_mode", false);
  const theme = getTheme(darkMode);

  useEffect(() => {
    document.body.style.background = theme.BG;
    document.body.style.color = theme.TEXT;
  }, [darkMode]);

  const cur = (amount) => `${Number(amount).toFixed(2)} €`;
  // Recompute S with current theme
  const S = makeS(theme);

  // ── Supabase data state ──────────────────────────────────────────────────
  const [ingredients, setIngredients] = useLocalStorage("pm_ingredients", [
    { name: "Chocolat", pricePerKg: 20, stock: 5000 },
    { name: "Sucre", pricePerKg: 2, stock: 10000 },
    { name: "Farine", pricePerKg: 1.5, stock: 8000 },
    { name: "Beurre", pricePerKg: 8, stock: 4000 },
  ]);
  const [recipes, setRecipes] = useLocalStorage("pm_recipes", []);
  const [orders, setOrders] = useLocalStorage("pm_orders", []);
  const [charges, setCharges] = useLocalStorage("pm_charges", [
    { name: "Loyer", amount: 1200, period: "Mensuel" },
    { name: "Électricité", amount: 200, period: "Mensuel" },
  ]);
  const [pertes, setPertes] = useLocalStorage("pm_pertes", []);
  const [planning, setPlanning] = useLocalStorage("pm_planning", []);
  const [vitrine, setVitrine] = useLocalStorage("pm_vitrine", []);
  const [fournisseurs, setFournisseurs] = useLocalStorage(
    "pm_fournisseurs",
    []
  );
  const [commandesFourn, setCommandesFourn] = useLocalStorage(
    "pm_commandes_fourn",
    []
  );
  const [prixHistorique, setPrixHistorique] = useLocalStorage(
    "pm_prix_historique",
    []
  );
  const [shopifyConfig, setShopifyConfig] = useLocalStorage("pm_shopify", {
    storeUrl: "",
    accessToken: "",
    enabled: false,
    lastSync: null,
  });
  const [shopifyOrders, setShopifyOrders] = useLocalStorage(
    "pm_shopify_orders",
    []
  );

  // ── Load data from Supabase when user logs in ────────────────────────────
  const loadFromSupabase = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const [ing, rec, ord, chg, per, pla, vit, fou, cof, prix] =
        await Promise.all([
          sbFetch("/ingredients?select=*&order=created_at"),
          sbFetch("/recipes?select=*&order=created_at"),
          sbFetch("/orders?select=*&order=created_at"),
          sbFetch("/charges?select=*&order=created_at"),
          sbFetch("/pertes?select=*&order=created_at"),
          sbFetch("/planning?select=*&order=created_at"),
          sbFetch("/vitrine?select=*&order=created_at"),
          sbFetch("/fournisseurs?select=*&order=created_at"),
          sbFetch("/commandes_fourn?select=*&order=created_at"),
          sbFetch("/prix_historique?select=*&order=created_at"),
        ]);
      // Map DB columns to app format
      if (ing?.length)
        setIngredients(
          ing.map((r) => ({ ...r, pricePerKg: r.price_per_kg, _id: r.id }))
        );
      if (rec?.length)
        setRecipes(
          rec.map((r) => ({
            ...r,
            costPerUnit: r.cost_per_unit,
            suggestedPrice: r.suggested_price,
            lossPct: r.loss_pct,
            laborHours: r.labor_hours,
            hourlyRate: r.hourly_rate,
            marginCoef: r.margin_coef,
            _id: r.id,
          }))
        );
      if (ord?.length)
        setOrders(
          ord.map((r) => ({
            ...r,
            recipeName: r.recipe_name,
            shopifyId: r.shopify_id,
            shopifyOrderNumber: r.shopify_order_number,
            _id: r.id,
          }))
        );
      if (chg?.length) setCharges(chg.map((r) => ({ ...r, _id: r.id })));
      if (per?.length) setPertes(per.map((r) => ({ ...r, _id: r.id })));
      if (pla?.length) setPlanning(pla.map((r) => ({ ...r, _id: r.id })));
      if (vit?.length)
        setVitrine(
          vit.map((r) => ({ ...r, recipeName: r.recipe_name, _id: r.id }))
        );
      if (fou?.length) setFournisseurs(fou.map((r) => ({ ...r, _id: r.id })));
      if (cof?.length) setCommandesFourn(cof.map((r) => ({ ...r, _id: r.id })));
      if (prix?.length)
        setPrixHistorique(
          prix.map((r) => ({
            ...r,
            ingredientName: r.ingredient_name,
            ancienPrix: r.ancien_prix,
            nouveauPrix: r.nouveau_prix,
            dateISO: r.date_iso,
            _id: r.id,
          }))
        );
    } catch (e) {
      console.error("Supabase load error:", e);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadFromSupabase();
  }, [user]);

  // ── Migrate localStorage data to Supabase on first login ────────────────
  useEffect(() => {
    if (!user) return;
    const migrated = localStorage.getItem("pm_migrated_" + user.id);
    if (migrated) return;
    // If user has local data, push it to Supabase
    setTimeout(async () => {
      try {
        const localIng = JSON.parse(
          localStorage.getItem("pm_ingredients") || "[]"
        );
        const localRec = JSON.parse(localStorage.getItem("pm_recipes") || "[]");
        const localOrd = JSON.parse(localStorage.getItem("pm_orders") || "[]");
        const localChg = JSON.parse(localStorage.getItem("pm_charges") || "[]");
        if (localIng.length > 0) await dbSetIngredients(localIng);
        if (localRec.length > 0) await dbSetRecipes(localRec);
        if (localOrd.length > 0) await dbSetOrders(localOrd);
        if (localChg.length > 0) await dbSetCharges(localChg);
        localStorage.setItem("pm_migrated_" + user.id, "1");
        console.log("✅ Local data migrated to Supabase");
      } catch (e) {
        console.warn("Migration error:", e);
      }
    }, 1000);
  }, [user]);

  // ── Save helpers ─────────────────────────────────────────────────────────
  const sbSave = async (table, data, idField = "_id") => {
    if (!user) return; // fallback to localStorage only
    const userId = user.id;
    try {
      if (data[idField]) {
        // Update
        const { [idField]: id, ...rest } = data;
        await sbFetch(`/${table}?id=eq.${id}`, {
          method: "PATCH",
          prefer: "return=minimal",
          body: JSON.stringify(rest),
        });
      } else {
        // Insert
        const row = { ...data, user_id: userId };
        await sbFetch(`/${table}`, {
          method: "POST",
          prefer: "return=representation",
          body: JSON.stringify(row),
        });
      }
    } catch (e) {
      console.warn("Supabase save error:", e);
    }
  };

  const sbDelete = async (table, id) => {
    if (!user || !id) return;
    try {
      await sbFetch(`/${table}?id=eq.${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Supabase delete error:", e);
    }
  };

  // ── Supabase-backed setters ──────────────────────────────────────────────
  // Each setter updates local state AND syncs to Supabase

  const makeDbSetter = (localSetter, table, toDb) => {
    return async (updater) => {
      // Update local state first (instant UI)
      let newItems;
      localSetter((prev) => {
        newItems = typeof updater === "function" ? updater(prev) : updater;
        return newItems;
      });
      if (!user) return;
      // Sync to Supabase
      setTimeout(async () => {
        try {
          const items = typeof updater === "function" ? newItems : updater;
          if (!Array.isArray(items)) return;
          // Full replace strategy: delete all user rows, re-insert
          // This is simple and reliable for small datasets
          await sbFetch(`/${table}?user_id=eq.${user.id}`, {
            method: "DELETE",
          });
          if (items.length > 0) {
            const rows = items.map((item) => ({
              ...toDb(item),
              user_id: user.id,
            }));
            await sbFetch(`/${table}`, {
              method: "POST",
              prefer: "return=minimal",
              body: JSON.stringify(rows),
            });
          }
        } catch (e) {
          console.warn(`Sync error (${table}):`, e);
        }
      }, 100);
    };
  };

  const dbSetIngredients = makeDbSetter(setIngredients, "ingredients", (i) => ({
    name: i.name,
    price_per_kg: i.pricePerKg || 0,
    stock: i.stock || 0,
  }));

  const dbSetRecipes = makeDbSetter(setRecipes, "recipes", (r) => ({
    name: r.name,
    portions: r.portions,
    loss_pct: r.lossPct,
    labor_hours: r.laborHours,
    hourly_rate: r.hourlyRate,
    margin_coef: r.marginCoef,
    notes: r.notes,
    ingredients: r.ingredients,
    cost_per_unit: r.costPerUnit,
    suggested_price: r.suggestedPrice,
  }));

  const dbSetOrders = makeDbSetter(setOrders, "orders", (o) => ({
    recipe_name: o.recipeName,
    quantity: o.quantity,
    price: o.price,
    cost: o.cost,
    client: o.client,
    note: o.note,
    date: o.date,
    status: o.status,
    shopify_id: o.shopifyId,
    shopify_order_number: o.shopifyOrderNumber,
    source: o.source || "manual",
  }));

  const dbSetCharges = makeDbSetter(setCharges, "charges", (c) => ({
    name: c.name,
    amount: c.amount,
    period: c.period,
  }));

  const dbSetPertes = makeDbSetter(setPertes, "pertes", (p) => ({
    type: p.type,
    name: p.name,
    quantity: p.quantity,
    cost: p.cost,
    reason: p.reason,
    date: p.date,
  }));

  const dbSetPlanning = makeDbSetter(setPlanning, "planning", (p) => ({
    date: p.date,
    recipe: p.recipe,
    quantity: p.quantity,
    note: p.note,
    done: p.done,
  }));

  const dbSetVitrine = makeDbSetter(setVitrine, "vitrine", (v) => ({
    date: v.date,
    recipe_name: v.recipeName,
    quantity: v.quantity,
  }));

  const dbSetFournisseurs = makeDbSetter(
    setFournisseurs,
    "fournisseurs",
    (f) => ({
      nom: f.nom,
      contact: f.contact,
      tel: f.tel,
      email: f.email,
      delai: f.delai,
      note: f.note,
      ingredients: f.ingredients,
    })
  );

  const dbSetCommandesFourn = makeDbSetter(
    setCommandesFourn,
    "commandes_fourn",
    (c) => ({
      fournisseur: c.fournisseur,
      date: c.date,
      lignes: c.lignes,
      total: c.total,
      statut: c.statut,
    })
  );

  const dbSetPrixHistorique = makeDbSetter(
    setPrixHistorique,
    "prix_historique",
    (h) => ({
      date: h.date,
      date_iso: h.dateISO,
      ingredient_name: h.ingredientName,
      ancien_prix: h.ancienPrix,
      nouveau_prix: h.nouveauPrix,
      source: h.source,
      variation: h.variation,
    })
  );

  // ── Auth handlers ────────────────────────────────────────────────────────
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    name: "",
  });
  const af = (k, v) => setAuthForm((prev) => ({ ...prev, [k]: v }));

  const handleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await sbAuthFetch("/token?grant_type=password", {
        email: authForm.email,
        password: authForm.password,
      });
      setUser(data.user);
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await sbAuthFetch("/signup", {
        email: authForm.email,
        password: authForm.password,
        data: { name: authForm.name },
      });
      if (data.user) setUser(data.user);
      else setAuthError("Vérifie ton email pour confirmer ton compte.");
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await sbSignOut();
    setUser(null);
  };

  // ── Show auth screen if not logged in ───────────────────────────────────
  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420, padding: "0 20px" }}>
          {/* Logo */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 40,
            }}
          >
            <img
              src={LOGO_B64}
              alt="Knead"
              style={{
                height: 200,
                objectFit: "contain",
                mixBlendMode: "multiply",
                display: "block",
              }}
            />
          </div>

          {/* Auth card */}
          <div
            style={{
              background: CARD_BG,
              borderRadius: 16,
              padding: 32,
              border: `1px solid ${BORDER}`,
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            }}
          >
            {/* Tabs */}
            <div
              style={{
                display: "flex",
                background: BG,
                borderRadius: 10,
                padding: 4,
                marginBottom: 28,
              }}
            >
              {[
                ["login", "Se connecter"],
                ["register", "Créer un compte"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => {
                    setAuthPage(id);
                    setAuthError(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    background: authPage === id ? CARD_BG : "transparent",
                    color: authPage === id ? NAVY : SLATE,
                    fontWeight: authPage === id ? 700 : 400,
                    fontSize: 14,
                    boxShadow:
                      authPage === id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    transition: "all .15s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {authPage === "register" && (
              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Votre nom</label>
                <input
                  style={S.input}
                  placeholder="Marie Dupont"
                  value={authForm.name}
                  onChange={(e) => af("name", e.target.value)}
                />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={S.label}>Email</label>
              <input
                style={S.input}
                type="email"
                placeholder="marie@patisserie.fr"
                value={authForm.email}
                onChange={(e) => af("email", e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={S.label}>Mot de passe</label>
              <input
                style={S.input}
                type="password"
                placeholder="••••••••"
                value={authForm.password}
                onChange={(e) => af("password", e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (authPage === "login" ? handleLogin() : handleRegister())
                }
              />
            </div>

            {authError && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: DANGER,
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 13,
                  marginBottom: 16,
                  fontWeight: 600,
                }}
              >
                {authError}
              </div>
            )}

            <button
              style={{
                ...btn(),
                width: "100%",
                padding: "12px",
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 10,
              }}
              onClick={authPage === "login" ? handleLogin : handleRegister}
              disabled={authLoading}
            >
              {authLoading
                ? "⏳ Chargement..."
                : authPage === "login"
                ? "Se connecter"
                : "Créer mon compte"}
            </button>

            <div
              style={{
                textAlign: "center",
                marginTop: 20,
                fontSize: 12,
                color: SLATE,
              }}
            >
              🔒 Vos données sont chiffrées et stockées de façon sécurisée
            </div>
          </div>

          {/* Demo note */}
          <div
            style={{
              textAlign: "center",
              marginTop: 20,
              fontSize: 12,
              color: SLATE2,
            }}
          >
            Première utilisation ? Créez un compte gratuit en 30 secondes.
          </div>
        </div>
      </div>
    );
  }

  // KPIs dashboard
  const totalRevenue = orders.reduce((s, o) => s + (o.price || 0), 0);

  // ── Onboarding ───────────────────────────────────────────────────────────
  const [onboardingDone, setOnboardingDone] = useLocalStorage(
    "pm_onboarding_done_" + (user?.id || ""),
    false
  );
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const ONBOARDING_STEPS = [
    {
      icon: "🧂",
      title: "Ajoutez vos ingrédients",
      desc: "Commencez par saisir vos matières premières avec leur prix au kg. Knead calculera automatiquement vos coûts de revient.",
      action: () => {
        setPage("ingredients");
        setOnboardingDone(true);
      },
      cta: "Ajouter mes ingrédients",
      color: ACCENT,
    },
    {
      icon: "📖",
      title: "Créez votre première recette",
      desc: "Saisissez les ingrédients, quantités et temps de travail. Knead calcule le prix conseillé et votre marge en temps réel.",
      action: () => {
        setPage("recipes");
        setOnboardingDone(true);
      },
      cta: "Créer une recette",
      color: "#8B5CF6",
    },
    {
      icon: "🛒",
      title: "Enregistrez vos commandes",
      desc: "Ajoutez vos commandes clients. Le stock se déduit automatiquement et votre tableau de bord se met à jour en temps réel.",
      action: () => {
        setPage("orders");
        setOnboardingDone(true);
      },
      cta: "Ajouter une commande",
      color: SUCCESS,
    },
    {
      icon: "📊",
      title: "Analysez votre rentabilité",
      desc: "Découvrez combien de produits vous devez vendre pour couvrir vos charges et vous payer. Le tableau du matin résume tout.",
      action: () => {
        setPage("matin");
        setOnboardingDone(true);
      },
      cta: "Voir mon tableau de bord",
      color: WARNING,
    },
  ];

  // Show onboarding only for new users (no ingredients yet)
  const isNewUser =
    !onboardingDone &&
    ingredients.filter(
      (i) => !["Chocolat", "Sucre", "Farine", "Beurre"].includes(i.name)
    ).length === 0 &&
    recipes.length === 0 &&
    orders.length === 0;

  // ── Trial & Paywall ───────────────────────────────────────────────────────
  const STRIPE_URL = "https://buy.stripe.com/eVq5kDdq80IvaBu2JS9k400";
  const TRIAL_DAYS = 14;

  // Store registration date — only when user is fully loaded
  const [registeredAt, setRegisteredAt] = useLocalStorage(
    "pm_registered_at_" + (user?.id || "guest"),
    null
  );
  const [isPaid] = useLocalStorage(
    "pm_is_paid_" + (user?.id || "guest"),
    false
  );

  // Set registration date only once, only when user is loaded
  useEffect(() => {
    if (user?.id && !registeredAt) {
      // Use Supabase user creation date if available, otherwise now
      const createdAt = user.created_at || new Date().toISOString();
      setRegisteredAt(createdAt);
    }
  }, [user?.id]);

  const trialDaysLeft = (() => {
    if (!user?.id || !registeredAt) return TRIAL_DAYS; // Not loaded yet — give full trial
    const reg = new Date(registeredAt);
    const now = new Date();
    const diff = Math.floor((now - reg) / (1000 * 60 * 60 * 24));
    return Math.max(0, TRIAL_DAYS - diff);
  })();

  const trialExpired =
    !dataLoading && user?.id && trialDaysLeft === 0 && !isPaid;

  if (trialExpired && !dataLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: NAVY,
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        {/* Logo */}
        <img
          src={LOGO_WHITE}
          alt="Knead"
          style={{ height: 80, objectFit: "contain", marginBottom: 40 }}
        />

        {/* Card paywall */}
        <div
          style={{
            background: "#161B22",
            borderRadius: 20,
            padding: "48px 40px",
            maxWidth: 480,
            width: "100%",
            textAlign: "center",
            border: "1px solid #30363D",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(37,99,235,0.15)",
              border: "1px solid rgba(37,99,235,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              margin: "0 auto 24px",
            }}
          >
            🔒
          </div>

          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#fff",
              marginBottom: 12,
              lineHeight: 1.2,
            }}
          >
            Votre essai gratuit est terminé
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#8B949E",
              marginBottom: 32,
              lineHeight: 1.7,
            }}
          >
            Vous avez utilisé vos 14 jours d'essai gratuit.
            <br />
            Continuez avec Knead pour seulement{" "}
            <b style={{ color: "#C9A84C" }}>29€/mois</b>.
          </p>

          {/* Features recap */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 32,
              textAlign: "left",
            }}
          >
            {[
              "✓ Toutes les fonctionnalités incluses",
              "✓ Intégration Shopify",
              "✓ Données sauvegardées dans le cloud",
              "✓ Export PDF & CSV",
              "✓ Support inclus",
              "✓ Prix bloqué à vie — offre Fondateur",
            ].map((f, i) => (
              <div key={i} style={{ fontSize: 14, color: "#6EE7B7" }}>
                {f}
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href={STRIPE_URL}
            style={{
              display: "block",
              background: ACCENT,
              color: "#fff",
              padding: "16px 32px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 16,
              textDecoration: "none",
              boxShadow: `0 8px 24px ${ACCENT}40`,
              transition: "all .2s",
              marginBottom: 16,
            }}
          >
            🚀 S'abonner pour 29€/mois
          </a>

          <div style={{ fontSize: 12, color: "#6E7681" }}>
            Aucune carte requise pour l'essai · Annulation à tout moment
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              marginTop: 20,
              background: "transparent",
              border: "none",
              color: "#6E7681",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  // ── Trial banner ──────────────────────────────────────────────────────────
  const showTrialBanner = !isPaid && trialDaysLeft > 0 && trialDaysLeft <= 7;

  if (isNewUser && !dataLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: BG,
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            background: NAVY,
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <img
            src={LOGO_WHITE}
            alt="Knead"
            style={{ height: 40, objectFit: "contain" }}
          />
          <button
            onClick={() => setOnboardingDone(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "#94A3B8",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Passer l'introduction →
          </button>
        </div>

        {/* Onboarding content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
          }}
        >
          <div style={{ maxWidth: 600, width: "100%" }}>
            {/* Welcome */}
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: NAVY,
                  marginBottom: 8,
                }}
              >
                Bienvenue sur Knead !
              </h1>
              <p style={{ fontSize: 16, color: SLATE, lineHeight: 1.6 }}>
                En 4 étapes simples, votre gestion est opérationnelle.
                <br />
                Cela prend moins de 10 minutes.
              </p>
            </div>

            {/* Steps */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 40,
              }}
            >
              {ONBOARDING_STEPS.map((step, i) => (
                <div
                  key={i}
                  onClick={() => setOnboardingStep(i)}
                  style={{
                    background: CARD_BG,
                    borderRadius: 14,
                    padding: "20px 24px",
                    border: `2px solid ${
                      onboardingStep === i ? step.color : BORDER
                    }`,
                    cursor: "pointer",
                    transition: "all .2s",
                    boxShadow:
                      onboardingStep === i
                        ? `0 4px 20px ${step.color}20`
                        : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      flexShrink: 0,
                      background: onboardingStep === i ? step.color : "#F1F5F9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      transition: "all .2s",
                    }}
                  >
                    {step.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        color: NAVY,
                        fontSize: 15,
                        marginBottom: 2,
                      }}
                    >
                      <span
                        style={{ color: SLATE2, fontSize: 12, marginRight: 8 }}
                      >
                        Étape {i + 1}
                      </span>
                      {step.title}
                    </div>
                    {onboardingStep === i && (
                      <div
                        style={{
                          fontSize: 13,
                          color: SLATE,
                          lineHeight: 1.6,
                          marginTop: 4,
                        }}
                      >
                        {step.desc}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      flexShrink: 0,
                      border: `2px solid ${
                        onboardingStep === i ? step.color : BORDER
                      }`,
                      background:
                        onboardingStep === i ? step.color : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {onboardingStep === i ? "→" : ""}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={ONBOARDING_STEPS[onboardingStep].action}
                style={{
                  ...btn(),
                  background: ONBOARDING_STEPS[onboardingStep].color,
                  padding: "14px 32px",
                  fontSize: 15,
                  fontWeight: 700,
                  boxShadow: `0 8px 24px ${ONBOARDING_STEPS[onboardingStep].color}40`,
                }}
              >
                {ONBOARDING_STEPS[onboardingStep].cta} →
              </button>
              {onboardingStep < ONBOARDING_STEPS.length - 1 && (
                <button
                  onClick={() => setOnboardingStep((s) => s + 1)}
                  style={{ ...btn(false), padding: "14px 24px", fontSize: 15 }}
                >
                  Étape suivante
                </button>
              )}
            </div>

            {/* Progress dots */}
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                marginTop: 32,
              }}
            >
              {ONBOARDING_STEPS.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setOnboardingStep(i)}
                  style={{
                    width: onboardingStep === i ? 24 : 8,
                    height: 8,
                    borderRadius: 99,
                    background: onboardingStep === i ? ACCENT : BORDER,
                    cursor: "pointer",
                    transition: "all .3s",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalCost = orders.reduce((s, o) => s + (o.cost || 0), 0);
  const totalMargin = totalRevenue - totalCost;
  const totalPertes = pertes.reduce((s, p) => s + (p.cost || 0), 0);
  const chargesMensuel = charges
    .filter((c) => c.period === "Monthly" || c.period === "Mensuel")
    .reduce((s, c) => s + (c.amount || 0), 0);
  const lowStock = ingredients.filter((i) => i.stock <= ALERT);

  const today = new Date().toISOString().slice(0, 10);
  const vitrineAujourdhui = vitrine.filter((v) => v.date === today);
  const totalVitrineAujourdhui = vitrineAujourdhui.reduce(
    (s, v) => s + (v.quantity || 0),
    0
  );

  // Calcul des besoins en ingrédients basé sur les commandes en cours
  const ordersEnCours = orders.filter((o) => o.status === "En cours");
  const ingredientNeeds = ingredients
    .map((ing) => {
      let needed = 0;
      ordersEnCours.forEach((order) => {
        const recipe = recipes.find((r) => r.name === order.recipeName);
        if (recipe) {
          const ingInRecipe = recipe.ingredients?.find(
            (i) => i.name === ing.name
          );
          if (ingInRecipe)
            needed += ingInRecipe.quantity * (order.quantity || 1);
        }
      });
      const manque = Math.max(0, needed - ing.stock);
      return {
        ...ing,
        needed,
        manque,
        ok: ing.stock >= needed && needed > 0,
        insuffisant: manque > 0,
        inutilise: needed === 0,
      };
    })
    .filter((i) => i.needed > 0 || i.stock <= ALERT);

  const salesData = recipes.map((r) => ({
    name: r.name.length > 12 ? r.name.slice(0, 12) + "…" : r.name,
    ["🛒 Commandes"]: orders
      .filter((o) => o.recipeName === r.name)
      .reduce((s, o) => s + (o.quantity || 0), 0),
  }));

  const NAV_GROUPS = [
    {
      label: "Aujourd'hui",
      items: [
        { id: "matin", icon: "🌅", label: "Mon matin" },
        { id: "dashboard", icon: "📊", label: "Dashboard" },
      ],
    },
    {
      label: "Production",
      items: [
        { id: "recipes", icon: "📖", label: "Recettes" },
        { id: "ingredients", icon: "🧂", label: "Ingrédients" },
        { id: "vitrine", icon: "🏪", label: "Vitrine" },
        { id: "planning", icon: "📅", label: "Planning" },
        { id: "pertes", icon: "🗑️", label: "Pertes" },
      ],
    },
    {
      label: "Commerce",
      items: [
        { id: "orders", icon: "🛒", label: "Commandes" },
        { id: "shopify", icon: "🟢", label: "Shopify" },
        { id: "fournisseurs", icon: "🏭", label: "Fournisseurs" },
        { id: "charges", icon: "💳", label: "Charges" },
      ],
    },
    {
      label: "Analyse",
      items: [
        { id: "seuil", icon: "📈", label: "Rentabilité" },
        { id: "prix", icon: "📜", label: "Historique prix" },
        { id: "export", icon: "📤", label: "Export" },
      ],
    },
  ];

  const allBadges = {
    orders: ordersEnCours.length,
    ingredients: lowStock.length,
    shopify: shopifyConfig.enabled ? 1 : 0,
  };

  // All nav items flat for mobile bottom bar (most used)
  const BOTTOM_NAV = [
    { id: "matin", icon: "🌅", label: "Matin" },
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "orders", icon: "🛒", label: "Commandes" },
    { id: "recipes", icon: "📖", label: "Recettes" },
    { id: "more", icon: "☰", label: "Plus" },
  ];

  const allNavItems = [
    ...NAV_GROUPS.flatMap((g) => g.items),
    { id: "settings", icon: "⚙️", label: "Réglages" },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: theme.BG,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── SIDEBAR (desktop only) ── */}
      {!isMobile && (
        <div
          style={{
            width: sidebarOpen ? 220 : 64,
            flexShrink: 0,
            background: NAVY,
            display: "flex",
            flexDirection: "column",
            transition: "width .2s ease",
            overflow: "hidden",
            position: "sticky",
            top: 0,
            height: "100vh",
          }}
        >
          {/* Logo */}
          <div
            style={{
              padding: "16px",
              borderBottom: `1px solid ${NAVY2}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <img
              src={LOGO_B64}
              alt="Knead"
              style={{
                height: sidebarOpen ? 40 : 32,
                width: sidebarOpen ? "auto" : 32,
                objectFit: "contain",
                filter: "brightness(0) invert(1)",
                flexShrink: 0,
                transition: "all .2s",
              }}
            />
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              style={{
                marginLeft: "auto",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: SLATE2,
                fontSize: 16,
                padding: 4,
                flexShrink: 0,
              }}
            >
              {sidebarOpen ? "◀" : "▶"}
            </button>
          </div>

          {/* Nav groups */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
            {NAV_GROUPS.map((group, gi) => (
              <div key={gi} style={{ marginBottom: 8 }}>
                {sidebarOpen && (
                  <div
                    style={{
                      color: SLATE2,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      padding: "8px 8px 4px",
                      textTransform: "uppercase",
                    }}
                  >
                    {group.label}
                  </div>
                )}
                {group.items.map((item) => {
                  const active = page === item.id;
                  const badge = allBadges[item.id];
                  return (
                    <button
                      key={item.id}
                      onClick={() => setPage(item.id)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: sidebarOpen ? "9px 10px" : "9px 0",
                        justifyContent: sidebarOpen ? "flex-start" : "center",
                        background: active ? ACCENT : "transparent",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        marginBottom: 2,
                        transition: "all .15s",
                        color: active ? "#fff" : SLATE2,
                      }}
                    >
                      <span style={{ fontSize: 16, flexShrink: 0 }}>
                        {item.icon}
                      </span>
                      {sidebarOpen && (
                        <>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: active ? 600 : 400,
                              flex: 1,
                              textAlign: "left",
                            }}
                          >
                            {item.label}
                          </span>
                          {badge > 0 && (
                            <span
                              style={{
                                background: DANGER,
                                color: "#fff",
                                borderRadius: 99,
                                fontSize: 10,
                                fontWeight: 700,
                                padding: "1px 6px",
                                flexShrink: 0,
                              }}
                            >
                              {badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
                {gi < NAV_GROUPS.length - 1 && (
                  <div
                    style={{ height: 1, background: NAVY2, margin: "8px 0" }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Settings en bas */}
          <div style={{ padding: "12px 8px", borderTop: `1px solid ${NAVY2}` }}>
            <button
              onClick={() => setPage("settings")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: sidebarOpen ? "9px 10px" : "9px 0",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                background: page === "settings" ? ACCENT : "transparent",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                color: page === "settings" ? "#fff" : SLATE2,
                transition: "all .15s",
              }}
            >
              <span style={{ fontSize: 16 }}>⚙️</span>
              {sidebarOpen && (
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: page === "settings" ? 600 : 400,
                  }}
                >
                  Réglages
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── MOBILE FULL MENU OVERLAY ── */}
      {isMobile && mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: NAVY,
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "20px 20px 10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${NAVY2}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={LOGO_WHITE}
                alt="Knead"
                style={{ height: 36, objectFit: "contain" }}
              />
              <div style={{ color: SLATE2, fontSize: 11 }}>{user?.email}</div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: 24,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            {NAV_GROUPS.map((group, gi) => (
              <div key={gi} style={{ marginBottom: 20 }}>
                <div
                  style={{
                    color: SLATE2,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  {group.label}
                </div>
                {group.items.map((item) => {
                  const active = page === item.id;
                  const badge = allBadges[item.id];
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setPage(item.id);
                        setMobileMenuOpen(false);
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "14px 16px",
                        background: active ? ACCENT : "transparent",
                        border: "none",
                        borderRadius: 12,
                        cursor: "pointer",
                        marginBottom: 4,
                        color: active ? "#fff" : SLATE2,
                        transition: "all .15s",
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: active ? 700 : 400,
                          flex: 1,
                          textAlign: "left",
                        }}
                      >
                        {item.label}
                      </span>
                      {badge > 0 && (
                        <span
                          style={{
                            background: DANGER,
                            color: "#fff",
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 8px",
                          }}
                        >
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div
            style={{
              padding: "16px",
              borderTop: `1px solid ${NAVY2}`,
              display: "flex",
              gap: 10,
            }}
          >
            <button
              onClick={() => {
                setPage("settings");
                setMobileMenuOpen(false);
              }}
              style={{ ...btn(false), flex: 1, color: SLATE2 }}
            >
              ⚙️ Réglages
            </button>
            <button
              onClick={handleLogout}
              style={{ ...btn(false, true), flex: 1 }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            background: theme.NAV_BG,
            borderBottom: `1px solid ${theme.BORDER}`,
            padding: isMobile ? "0 16px" : "0 28px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 10,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 20,
                  color: theme.TEXT,
                  padding: "4px 8px 4px 0",
                }}
              >
                ☰
              </button>
            )}
            <div
              style={{
                fontWeight: 700,
                fontSize: isMobile ? 15 : 18,
                color: theme.TEXT,
              }}
            >
              {allNavItems.find((p) => p.id === page)?.icon}{" "}
              {allNavItems.find((p) => p.id === page)?.label}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {dataLoading && (
              <span style={{ fontSize: 12, color: SLATE }}>⏳</span>
            )}
            {!isMobile && ordersEnCours.length > 0 && (
              <div
                style={{
                  background: "#EFF6FF",
                  color: ACCENT,
                  borderRadius: 8,
                  padding: "5px 12px",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                🛒 {ordersEnCours.length} en cours
              </div>
            )}
            {!isMobile && lowStock.length > 0 && (
              <div
                style={{
                  background: "#FEF2F2",
                  color: DANGER,
                  borderRadius: 8,
                  padding: "5px 12px",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                ⚠️ {lowStock.length} faible{lowStock.length > 1 ? "s" : ""}
              </div>
            )}
            <button
              onClick={() => setDarkMode((v) => !v)}
              title={darkMode ? "Mode clair" : "Mode sombre"}
              style={{
                background: darkMode ? "#21262D" : "#F1F5F9",
                border: `1px solid ${theme.BORDER}`,
                borderRadius: 8,
                cursor: "pointer",
                width: 34,
                height: 34,
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button
              onClick={handleLogout}
              title="Se déconnecter"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: ACCENT,
                border: "none",
                cursor: "pointer",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {(user?.email || "U")[0].toUpperCase()}
            </button>
          </div>
        </div>

        {/* Mobile alerts bar */}
        {isMobile && (ordersEnCours.length > 0 || lowStock.length > 0) && (
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: "8px 16px",
              background: theme.NAV_BG,
              borderBottom: `1px solid ${theme.BORDER}`,
              flexWrap: "wrap",
            }}
          >
            {ordersEnCours.length > 0 && (
              <div
                style={{
                  background: "#EFF6FF",
                  color: ACCENT,
                  borderRadius: 8,
                  padding: "4px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                🛒 {ordersEnCours.length} commande
                {ordersEnCours.length > 1 ? "s" : ""} en cours
              </div>
            )}
            {lowStock.length > 0 && (
              <div
                style={{
                  background: "#FEF2F2",
                  color: DANGER,
                  borderRadius: 8,
                  padding: "4px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                ⚠️ {lowStock.length} stock{lowStock.length > 1 ? "s" : ""}{" "}
                faible{lowStock.length > 1 ? "s" : ""}
              </div>
            )}
          </div>
        )}

        {/* Page content */}
        <div
          style={{
            flex: 1,
            padding: isMobile ? "16px" : "28px",
            overflowY: "auto",
            paddingBottom: isMobile ? "80px" : "28px",
            background: theme.BG,
          }}
        >
          {/* Trial banner */}
          {showTrialBanner && (
            <div
              style={{
                background: "linear-gradient(135deg, #1A3260, #0F2044)",
                border: "1px solid rgba(37,99,235,0.3)",
                borderRadius: 12,
                padding: "12px 20px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>⏳</span>
                <div>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>
                    Essai gratuit — {trialDaysLeft} jour
                    {trialDaysLeft > 1 ? "s" : ""} restant
                    {trialDaysLeft > 1 ? "s" : ""}
                  </div>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>
                    Passez au plan Fondateur à 29€/mois pour continuer après
                    l'essai
                  </div>
                </div>
              </div>
              <a
                href={STRIPE_URL}
                style={{
                  background: "#C9A84C",
                  color: NAVY,
                  padding: "8px 18px",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                  flexShrink: 0,
                }}
              >
                S'abonner →
              </a>
            </div>
          )}

          {/* ── MATIN ──────────────────────────────────────────────────────────── */}
          {page === "matin" && (
            <MatinPage
              orders={orders}
              recipes={recipes}
              ingredients={ingredients}
              planning={planning}
              setPlanning={dbSetPlanning}
              vitrine={vitrine}
              setVitrine={dbSetVitrine}
              ingredientNeeds={ingredientNeeds}
              ordersEnCours={ordersEnCours}
              today={today}
              setIngredients={dbSetIngredients}
              setPage={setPage}
              cur={cur}
            />
          )}

          {/* ── DASHBOARD ──────────────────────────────────────────────────────── */}
          {page === "dashboard" && (
            <div>
              {/* KPIs */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                <KPI
                  title="💰 Chiffre d'affaires"
                  value={totalRevenue.toFixed(2) + " €"}
                />
                <KPI
                  title="📈 Marge nette"
                  value={totalMargin.toFixed(2) + " €"}
                  accent={totalMargin >= 0 ? SUCCESS : DANGER}
                />
                <KPI title="🛒 Commandes" value={orders.length} />
                <KPI
                  title="🗑️ Pertes"
                  value={totalPertes.toFixed(2) + " €"}
                  accent={DANGER}
                />
                <KPI
                  title="💳 Charges / mois"
                  value={chargesMensuel.toFixed(2) + " €"}
                />
                <KPI
                  title="📦 Stocks faibles"
                  value={lowStock.length}
                  accent={lowStock.length > 0 ? DANGER : SUCCESS}
                />
                <KPI
                  title="🏪 Vitrine aujourd'hui"
                  value={`${totalVitrineAujourdhui} gâteaux`}
                  accent={WARNING}
                  sub={
                    vitrineAujourdhui.length > 0
                      ? vitrineAujourdhui
                          .map((v) => `${v.quantity}× ${v.recipeName}`)
                          .join(", ")
                      : "—"
                  }
                />
              </div>

              {/* Ajout vitrine rapide depuis dashboard */}
              <VitrineQuickAdd
                recipes={recipes}
                ingredients={ingredients}
                setIngredients={dbSetIngredients}
                vitrine={vitrine}
                setVitrine={dbSetVitrine}
                today={today}
              />

              {/* Alerte intelligente stocks + besoins commandes */}
              <AlerteBesoins
                ingredientNeeds={ingredientNeeds}
                ordersEnCours={ordersEnCours}
                lowStock={lowStock}
              />

              {/* Graphiques */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 16,
                }}
              >
                <div style={S.card}>
                  <div
                    style={{ fontWeight: 700, color: DARK, marginBottom: 12 }}
                  >
                    📈 Ventes par recette
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={salesData}
                      margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
                    >
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar
                        dataKey="🛒 Commandes"
                        fill={ACCENT}
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={S.card}>
                  <div
                    style={{ fontWeight: 700, color: DARK, marginBottom: 12 }}
                  >
                    📦 Répartition des stocks
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={ingredients}
                        dataKey="stock"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        label={false}
                      >
                        {ingredients.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `${v} g`} />
                      <Legend
                        iconSize={10}
                        iconType="circle"
                        wrapperStyle={{ fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Commandes récentes */}
              {orders.length > 0 && (
                <div style={S.card}>
                  <div
                    style={{ fontWeight: 700, color: DARK, marginBottom: 12 }}
                  >
                    🛒 Dernières commandes
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={S.tableHead}>
                        {[
                          "Recette",
                          "Qté",
                          "Prix",
                          "Coût",
                          "Marge",
                          "Date",
                        ].map((h) => (
                          <th
                            key={h}
                            style={{ ...S.tableTd, textAlign: "left" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .slice(-5)
                        .reverse()
                        .map((o, i) => (
                          <tr key={i}>
                            <td style={S.tableTd}>{o.recipeName}</td>
                            <td style={S.tableTd}>{o.quantity}</td>
                            <td style={S.tableTd}>
                              {(o.price || 0).toFixed(2) + " €"}
                            </td>
                            <td style={S.tableTd}>
                              {(o.cost || 0).toFixed(2) + " €"}
                            </td>
                            <td
                              style={{
                                ...S.tableTd,
                                ...(o.price - o.cost >= 0 ? S.ok : S.danger),
                              }}
                            >
                              {(o.price || 0).toFixed(2) + " €" - (o.cost || 0)}
                            </td>
                            <td
                              style={{
                                ...S.tableTd,
                                color: "#888",
                                fontSize: 12,
                              }}
                            >
                              {o.date || "—"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── INGRÉDIENTS ────────────────────────────────────────────────────── */}
          {page === "ingredients" && (
            <IngredientsPage
              ingredients={ingredients}
              setIngredients={dbSetIngredients}
              cur={cur}
              theme={theme}
            />
          )}

          {/* ── RECETTES ───────────────────────────────────────────────────────── */}
          {page === "recipes" && (
            <RecipesPage
              recipes={recipes}
              setRecipes={dbSetRecipes}
              ingredients={ingredients}
              charges={charges}
              cur={cur}
              theme={theme}
            />
          )}

          {/* ── COMMANDES ──────────────────────────────────────────────────────── */}
          {page === "orders" && (
            <OrdersPage
              orders={orders}
              setOrders={dbSetOrders}
              recipes={recipes}
              ingredients={ingredients}
              setIngredients={dbSetIngredients}
              cur={cur}
              theme={theme}
              theme={theme}
            />
          )}

          {/* ── PLANNING ───────────────────────────────────────────────────────── */}
          {page === "planning" && (
            <PlanningPage
              planning={planning}
              setPlanning={dbSetPlanning}
              recipes={recipes}
            />
          )}

          {/* ── VITRINE ────────────────────────────────────────────────────────── */}
          {page === "vitrine" && (
            <VitrinePage
              vitrine={vitrine}
              setVitrine={dbSetVitrine}
              recipes={recipes}
              ingredients={ingredients}
              setIngredients={dbSetIngredients}
              today={today}
            />
          )}

          {/* ── FOURNISSEURS ───────────────────────────────────────────────────── */}
          {page === "fournisseurs" && (
            <FournisseursPage
              fournisseurs={fournisseurs}
              setFournisseurs={dbSetFournisseurs}
              commandesFourn={commandesFourn}
              setCommandesFourn={dbSetCommandesFourn}
              ingredients={ingredients}
              setIngredients={dbSetIngredients}
              ingredientNeeds={ingredientNeeds}
              aCommander={ingredientNeeds.filter((i) => i.insuffisant)}
              recipes={recipes}
              setRecipes={dbSetRecipes}
              prixHistorique={prixHistorique}
              setPrixHistorique={dbSetPrixHistorique}
              cur={cur}
            />
          )}

          {/* ── CHARGES ────────────────────────────────────────────────────────── */}
          {page === "charges" && (
            <ChargesPage
              charges={charges}
              setCharges={dbSetCharges}
              cur={cur}
              theme={theme}
            />
          )}

          {/* ── SHOPIFY ────────────────────────────────────────────────────────── */}
          {page === "shopify" && (
            <ShopifyPage
              shopifyConfig={shopifyConfig}
              setShopifyConfig={setShopifyConfig}
              shopifyOrders={shopifyOrders}
              setShopifyOrders={setShopifyOrders}
              orders={orders}
              setOrders={dbSetOrders}
              recipes={recipes}
              ingredients={ingredients}
              setIngredients={dbSetIngredients}
              cur={cur}
            />
          )}

          {/* ── PERTES ─────────────────────────────────────────────────────────── */}
          {page === "pertes" && (
            <PertesPage
              pertes={pertes}
              setPertes={dbSetPertes}
              ingredients={ingredients}
              setIngredients={dbSetIngredients}
              recipes={recipes}
              cur={cur}
              theme={theme}
            />
          )}

          {/* ── SEUIL RENTABILITÉ ──────────────────────────────────────────────── */}
          {page === "seuil" && (
            <SeuilRentabilite
              charges={charges}
              recipes={recipes}
              orders={orders}
              pertes={pertes}
              cur={cur}
            />
          )}

          {/* ── HISTORIQUE DES PRIX ────────────────────────────────────────────── */}
          {page === "prix" && (
            <PrixHistoriquePage
              ingredients={ingredients}
              setIngredients={dbSetIngredients}
              prixHistorique={prixHistorique}
              setPrixHistorique={dbSetPrixHistorique}
              recipes={recipes}
              setRecipes={dbSetRecipes}
              fournisseurs={fournisseurs}
              cur={cur}
            />
          )}

          {/* ── EXPORT ─────────────────────────────────────────────────────────── */}
          {page === "export" && (
            <ExportPage
              orders={orders}
              recipes={recipes}
              ingredients={ingredients}
              charges={charges}
              pertes={pertes}
              planning={planning}
              vitrine={vitrine}
              fournisseurs={fournisseurs}
              commandesFourn={commandesFourn}
              prixHistorique={prixHistorique}
            />
          )}

          {/* ── RÉGLAGES ───────────────────────────────────────────────────────── */}
          {page === "settings" && <SettingsPage />}
        </div>
        {/* end page content */}

        {/* ── MOBILE BOTTOM NAV ── */}
        {isMobile && (
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 50,
              background: CARD_BG,
              borderTop: `1px solid ${BORDER}`,
              display: "flex",
              height: 64,
              boxShadow: "0 -2px 10px rgba(0,0,0,0.08)",
            }}
          >
            {BOTTOM_NAV.map((item) => {
              const active =
                item.id === "more" ? mobileMenuOpen : page === item.id;
              const badge = allBadges[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() =>
                    item.id === "more"
                      ? setMobileMenuOpen(true)
                      : (setPage(item.id), setMobileMenuOpen(false))
                  }
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 3,
                    border: "none",
                    cursor: "pointer",
                    background: "transparent",
                    color: active ? ACCENT : SLATE2,
                    position: "relative",
                    transition: "color .15s",
                  }}
                >
                  <span style={{ fontSize: 20, position: "relative" }}>
                    {item.icon}
                    {badge > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: -4,
                          right: -6,
                          background: DANGER,
                          color: "#fff",
                          borderRadius: 99,
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "1px 4px",
                          minWidth: 14,
                          textAlign: "center",
                        }}
                      >
                        {badge}
                      </span>
                    )}
                  </span>
                  <span
                    style={{ fontSize: 10, fontWeight: active ? 700 : 400 }}
                  >
                    {item.label}
                  </span>
                  {active && item.id !== "more" && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: "20%",
                        right: "20%",
                        height: 2,
                        background: ACCENT,
                        borderRadius: 99,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {/* end main content */}
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KPI({ title, value, accent = ACCENT, sub, theme }) {
  const t = theme || getTheme(false);
  return (
    <div
      style={{
        background: t.CARD_BG,
        borderRadius: 12,
        padding: "18px 20px",
        border: `1px solid ${t.BORDER}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        borderTop: `3px solid ${accent}`,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: t.SLATE,
          fontWeight: 600,
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: t.TEXT }}>
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 11,
            color: t.SLATE2,
            marginTop: 4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

// ── ALERTE BESOINS ────────────────────────────────────────────────────────────
function AlerteBesoins({ ingredientNeeds, ordersEnCours, lowStock }) {
  const aCommander = ingredientNeeds.filter((i) => i.insuffisant);
  const stockFaibleSansCommande = lowStock.filter(
    (i) => !ingredientNeeds.find((n) => n.name === i.name)
  );

  if (ordersEnCours.length === 0 && lowStock.length === 0) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Bloc besoins commandes en cours */}
      {ordersEnCours.length > 0 && (
        <div
          style={{
            ...S.card,
            background: aCommander.length > 0 ? "#fff3f3" : "#f1f8e9",
            border: `1.5px solid ${
              aCommander.length > 0 ? "#ffcdd2" : "#c5e1a5"
            }`,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <span style={{ fontSize: 20 }}>
              {aCommander.length > 0 ? "🚨" : "✅"}
            </span>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: aCommander.length > 0 ? "#c62828" : "#2e7d32",
                }}
              >
                {aCommander.length > 0
                  ? `${aCommander.length} ingrédient${
                      aCommander.length > 1 ? "s" : ""
                    } à commander pour honorer vos commandes`
                  : "Stocks suffisants pour toutes les commandes en cours"}
              </div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                {ordersEnCours.length} commande
                {ordersEnCours.length > 1 ? "s" : ""} en cours :&nbsp;
                {ordersEnCours
                  .map((o) => `${o.quantity}× ${o.recipeName}`)
                  .join(", ")}
              </div>
            </div>
          </div>

          {ingredientNeeds.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: aCommander.length > 0 ? "#ffebee" : "#dcedc8",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#555",
                  }}
                >
                  {[
                    "Ingrédient",
                    "Besoin total",
                    "Stock actuel",
                    "À commander",
                    "Statut",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{ padding: "8px 12px", textAlign: "left" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ingredientNeeds.map((ing, i) => (
                  <tr
                    key={i}
                    style={{
                      background: i % 2 === 0 ? "transparent" : "#F8FAFC88",
                    }}
                  >
                    <td style={{ ...S.tableTd, fontWeight: 700 }}>
                      {ing.name}
                    </td>
                    <td style={S.tableTd}>
                      {ing.needed >= 1000
                        ? `${(ing.needed / 1000).toFixed(2)} kg`
                        : `${Math.round(ing.needed)} g`}
                    </td>
                    <td style={S.tableTd}>
                      {ing.stock >= 1000
                        ? `${(ing.stock / 1000).toFixed(2)} kg`
                        : `${ing.stock} g`}
                    </td>
                    <td
                      style={{
                        ...S.tableTd,
                        fontWeight: 700,
                        color: ing.insuffisant ? "#e53935" : "#2e7d32",
                      }}
                    >
                      {ing.insuffisant
                        ? ing.manque >= 1000
                          ? `⚠️ ${(ing.manque / 1000).toFixed(2)} kg`
                          : `⚠️ ${Math.round(ing.manque)} g`
                        : "✅ OK"}
                    </td>
                    <td style={S.tableTd}>
                      <span
                        style={{
                          background: ing.insuffisant ? "#ffebee" : "#e8f5e9",
                          color: ing.insuffisant ? "#e53935" : "#2e7d32",
                          borderRadius: 8,
                          padding: "3px 10px",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {ing.insuffisant ? "À commander" : "Suffisant"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Résumé commande rapide */}
          {aCommander.length > 0 && (
            <div
              style={{
                marginTop: 14,
                background: "#ffebee",
                borderRadius: 10,
                padding: "12px 16px",
              }}
            >
              <div
                style={{ fontWeight: 700, color: "#c62828", marginBottom: 8 }}
              >
                🛒 Liste de courses à passer :
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {aCommander.map((ing) => (
                  <span
                    key={ing.name}
                    style={{
                      background: "#fff",
                      border: "1.5px solid #ffcdd2",
                      borderRadius: 8,
                      padding: "6px 14px",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#c62828",
                    }}
                  >
                    {ing.name} :{" "}
                    {ing.manque >= 1000
                      ? `${(ing.manque / 1000).toFixed(2)} kg`
                      : `${Math.round(ing.manque)} g`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stocks faibles indépendants des commandes */}
      {stockFaibleSansCommande.length > 0 && (
        <div
          style={{
            ...S.card,
            background: "#fff8e1",
            border: "1.5px solid #ffe082",
          }}
        >
          <div style={{ fontWeight: 700, color: "#f57f17", marginBottom: 8 }}>
            ⚠️ Stocks faibles (indépendamment des commandes)
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {stockFaibleSansCommande.map((i) => (
              <span
                key={i.name}
                style={{
                  background: "#fff3e0",
                  color: "#e65100",
                  borderRadius: 8,
                  padding: "4px 12px",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {i.name} : {i.stock} g
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MATIN PAGE ────────────────────────────────────────────────────────────────
function MatinPage({
  orders,
  recipes,
  ingredients,
  planning,
  setPlanning,
  vitrine,
  setVitrine,
  ingredientNeeds,
  ordersEnCours,
  today,
  setIngredients,
  setPage,
}) {
  const heure = new Date().getHours();
  const salut =
    heure < 5
      ? "Bonne nuit"
      : heure < 12
      ? "Bonjour"
      : heure < 18
      ? "Bon après-midi"
      : "Bonsoir";
  const dateStr = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const planningAujourdhui = planning.filter((p) => p.date === today);
  const planningAFaire = planningAujourdhui.filter((p) => !p.done);
  const aLivrer = orders.filter(
    (o) =>
      o.date === new Date().toLocaleDateString("fr-FR") &&
      o.status === "En cours"
  );
  const aCommander = ingredientNeeds.filter((i) => i.insuffisant);
  const vitrineToday = vitrine.filter((v) => v.date === today);
  const totalVitrine = vitrineToday.reduce((s, v) => s + v.quantity, 0);
  const lowStockAlerts = ingredients.filter((i) => i.stock <= ALERT);

  // Notifications système
  const [notifOpen, setNotifOpen] = useState(false);
  const notifications = [
    ...aCommander.map((ing) => ({
      id: `stock-${ing.name}`,
      type: "danger",
      icon: "🚨",
      title: `Stock critique : ${ing.name}`,
      desc: `Manque ${
        ing.manque >= 1000
          ? (ing.manque / 1000).toFixed(1) + "kg"
          : Math.round(ing.manque) + "g"
      } pour les commandes en cours`,
      action: () => setPage("ingredients"),
      actionLabel: "Voir les stocks",
    })),
    ...lowStockAlerts
      .filter((i) => !aCommander.find((a) => a.name === i.name))
      .map((i) => ({
        id: `low-${i.name}`,
        type: "warning",
        icon: "⚠️",
        title: `Stock faible : ${i.name}`,
        desc: `${i.stock}g restants — seuil d'alerte atteint`,
        action: () => setPage("ingredients"),
        actionLabel: "Réapprovisionner",
      })),
    ...ordersEnCours
      .filter((o) => {
        if (!o.date) return false;
        const parts = o.date.split("/");
        if (parts.length < 3) return false;
        const orderDate = new Date(parts[2], parts[1] - 1, parts[0]);
        return orderDate < new Date() && o.status === "En cours";
      })
      .map((o) => ({
        id: `order-${o.recipeName}`,
        type: "warning",
        icon: "🛒",
        title: `Commande en retard : ${o.recipeName}`,
        desc: `Client : ${o.client} · ${o.quantity} pcs · ${(
          o.price || 0
        ).toFixed(2)}€`,
        action: () => setPage("orders"),
        actionLabel: "Voir les commandes",
      })),
    ...(planningAFaire.length > 0 && heure >= 16
      ? [
          {
            id: "planning-late",
            type: "info",
            icon: "📅",
            title: `${planningAFaire.length} tâche${
              planningAFaire.length > 1 ? "s" : ""
            } de production non faite${planningAFaire.length > 1 ? "s" : ""}`,
            desc: planningAFaire
              .map((p) => `${p.recipe} (${p.quantity} pcs)`)
              .join(", "),
            action: () => setPage("planning"),
            actionLabel: "Voir le planning",
          },
        ]
      : []),
  ];

  const score = [
    aCommander.length === 0,
    ordersEnCours.length > 0,
    planningAFaire.length === 0 && planningAujourdhui.length > 0,
    totalVitrine > 0,
  ].filter(Boolean).length;

  const scoreConfig =
    score >= 4
      ? {
          color: SUCCESS,
          bg: "#F0FDF4",
          border: "#BBF7D0",
          emoji: "🎯",
          label: "Journée parfaite !",
          sub: "Tout est sous contrôle",
        }
      : score >= 3
      ? {
          color: SUCCESS,
          bg: "#F0FDF4",
          border: "#BBF7D0",
          emoji: "💪",
          label: "Bonne journée en vue",
          sub: "Quelques points à optimiser",
        }
      : score >= 2
      ? {
          color: WARNING,
          bg: "#FFFBEB",
          border: "#FDE68A",
          emoji: "⚡",
          label: "Points à régler",
          sub: "Vérifiez les alertes ci-dessous",
        }
      : {
          color: DANGER,
          bg: "#FEF2F2",
          border: "#FECACA",
          emoji: "🔴",
          label: "Attention requise",
          sub: "Des actions sont nécessaires",
        };

  const togglePlanning = (idx) => {
    const globalIdx = planning.indexOf(planningAujourdhui[idx]);
    setPlanning((prev) =>
      prev.map((p, i) => (i === globalIdx ? { ...p, done: !p.done } : p))
    );
  };

  const [vitrineRapide, setVitrineRapide] = useState({ recipe: "", qty: 1 });
  const addVitrine = () => {
    const recipe = recipes.find((r) => r.name === vitrineRapide.recipe);
    if (!recipe) return;
    recipe.ingredients?.forEach((ing) => {
      setIngredients((prev) =>
        prev.map((i) =>
          i.name === ing.name
            ? {
                ...i,
                stock: Math.max(0, i.stock - ing.quantity * +vitrineRapide.qty),
              }
            : i
        )
      );
    });
    setVitrine((prev) => [
      ...prev,
      { date: today, recipeName: recipe.name, quantity: +vitrineRapide.qty },
    ]);
    setVitrineRapide({ recipe: "", qty: 1 });
  };

  return (
    <div>
      {/* ── HEADER MATIN PREMIUM ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 100%)`,
          borderRadius: 16,
          padding: "28px 32px",
          marginBottom: 20,
          position: "relative",
          overflow: "hidden",
          boxShadow: `0 8px 32px ${NAVY}40`,
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            right: 80,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
            pointerEvents: "none",
          }}
        />

        {/* Top row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 24,
            position: "relative",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.6)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 6,
              }}
            >
              {dateStr}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>
              {scoreConfig.emoji} {salut} !
            </div>
          </div>

          {/* Score badge + notif */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {/* Notification bell */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background:
                    notifications.length > 0
                      ? "rgba(239,68,68,0.2)"
                      : "rgba(255,255,255,0.1)",
                  border:
                    notifications.length > 0
                      ? "1px solid rgba(239,68,68,0.4)"
                      : "1px solid rgba(255,255,255,0.15)",
                  cursor: "pointer",
                  color: "#fff",
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                🔔
              </button>
              {notifications.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    background: DANGER,
                    color: "#fff",
                    borderRadius: 99,
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    border: "2px solid white",
                  }}
                >
                  {notifications.length}
                </div>
              )}
            </div>

            {/* Score pill */}
            <div
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 12,
                padding: "10px 18px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: 2,
                  letterSpacing: "0.08em",
                }}
              >
                SCORE
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>
                {score}
                <span style={{ fontSize: 14, opacity: 0.6 }}>/4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Score bar + label */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
              {scoreConfig.label}
            </span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
              {scoreConfig.sub}
            </span>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: 99,
              height: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: `linear-gradient(90deg, ${scoreConfig.color}, ${scoreConfig.color}CC)`,
                height: "100%",
                width: `${(score / 4) * 100}%`,
                borderRadius: 99,
                transition: "width .8s cubic-bezier(.4,0,.2,1)",
              }}
            />
          </div>
        </div>

        {/* Score items */}
        <div
          style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}
        >
          {[
            { ok: aCommander.length === 0, label: "Stocks OK" },
            { ok: ordersEnCours.length > 0, label: "Commandes" },
            {
              ok: planningAFaire.length === 0 && planningAujourdhui.length > 0,
              label: "Production",
            },
            { ok: totalVitrine > 0, label: "Vitrine" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: item.ok
                  ? "rgba(16,185,129,0.15)"
                  : "rgba(255,255,255,0.08)",
                border: `1px solid ${
                  item.ok ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"
                }`,
                borderRadius: 99,
                padding: "4px 12px",
                fontSize: 12,
                color: item.ok ? "#6EE7B7" : "rgba(255,255,255,0.5)",
              }}
            >
              <span>{item.ok ? "✓" : "○"}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── PANNEAU NOTIFICATIONS ── */}
      {notifOpen && (
        <div
          style={{
            ...S.card,
            marginBottom: 20,
            border: `1px solid ${
              notifications.length > 0 ? "#FECACA" : BORDER
            }`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div style={{ fontWeight: 700, color: NAVY, fontSize: 15 }}>
              🔔 Notifications
              {notifications.length > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    background: DANGER,
                    color: "#fff",
                    borderRadius: 99,
                    padding: "2px 8px",
                    fontSize: 12,
                  }}
                >
                  {notifications.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setNotifOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: SLATE,
                fontSize: 18,
              }}
            >
              ✕
            </button>
          </div>

          {notifications.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "20px 0", color: SLATE }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ fontWeight: 600, color: SUCCESS }}>
                Tout est en ordre !
              </div>
              <div style={{ fontSize: 13, marginTop: 4 }}>
                Aucune alerte pour le moment
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    background:
                      notif.type === "danger"
                        ? "#FEF2F2"
                        : notif.type === "warning"
                        ? "#FFFBEB"
                        : "#EFF6FF",
                    border: `1px solid ${
                      notif.type === "danger"
                        ? "#FECACA"
                        : notif.type === "warning"
                        ? "#FDE68A"
                        : "#BFDBFE"
                    }`,
                    borderRadius: 10,
                    padding: "12px 16px",
                  }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>
                    {notif.icon}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: NAVY,
                        marginBottom: 2,
                      }}
                    >
                      {notif.title}
                    </div>
                    <div style={{ fontSize: 13, color: SLATE }}>
                      {notif.desc}
                    </div>
                  </div>
                  <button
                    onClick={notif.action}
                    style={{
                      ...btn(),
                      padding: "6px 12px",
                      fontSize: 12,
                      flexShrink: 0,
                      background:
                        notif.type === "danger"
                          ? DANGER
                          : notif.type === "warning"
                          ? WARNING
                          : ACCENT,
                    }}
                  >
                    {notif.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4 blocs en grille */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Bloc 1 : Production du jour */}
        <div style={{ ...S.card, margin: 0 }}>
          <div
            style={{
              fontWeight: 700,
              color: DARK,
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>🧑‍🍳 Production du jour</span>
            <span style={{ fontSize: 12, color: "#888" }}>
              {planningAFaire.length} tâche
              {planningAFaire.length !== 1 ? "s" : ""} restante
              {planningAFaire.length !== 1 ? "s" : ""}
            </span>
          </div>
          {planningAujourdhui.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
              <div style={{ fontSize: 13, color: "#bbb" }}>
                Rien de planifié aujourd'hui
              </div>
              <button
                style={{ ...btn(false), marginTop: 12, fontSize: 12 }}
                onClick={() => setPage("planning")}
              >
                + Ajouter au planning
              </button>
            </div>
          ) : (
            planningAujourdhui.map((p, i) => (
              <div
                key={i}
                onClick={() => togglePlanning(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 0",
                  borderBottom: "1px solid #fce4ec",
                  cursor: "pointer",
                  opacity: p.done ? 0.5 : 1,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    flexShrink: 0,
                    background: p.done ? "#2e7d32" : "transparent",
                    border: `2px solid ${p.done ? "#2e7d32" : "#E2E8F0"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {p.done && (
                    <span
                      style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}
                    >
                      ✓
                    </span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: DARK,
                      textDecoration: p.done ? "line-through" : "none",
                    }}
                  >
                    {p.recipe}
                  </div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {p.quantity} pièces
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bloc 2 : Commandes à livrer */}
        <div style={{ ...S.card, margin: 0 }}>
          <div
            style={{
              fontWeight: 700,
              color: DARK,
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>🚚 Commandes en cours</span>
            <span style={{ fontSize: 12, color: "#888" }}>
              {ordersEnCours.length} commande
              {ordersEnCours.length !== 1 ? "s" : ""}
            </span>
          </div>
          {ordersEnCours.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 13, color: "#bbb" }}>
                Aucune commande en attente
              </div>
              <button
                style={{ ...btn(false), marginTop: 12, fontSize: 12 }}
                onClick={() => setPage("orders")}
              >
                + Créer une commande
              </button>
            </div>
          ) : (
            ordersEnCours.slice(0, 5).map((o, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid #fce4ec",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>
                    {o.recipeName}
                  </div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {o.client !== "—" ? o.client : "Client non renseigné"} ·{" "}
                    {o.quantity} pcs
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: PINK }}>
                  {(o.price || 0).toFixed(2) + " €"}
                </div>
              </div>
            ))
          )}
          {ordersEnCours.length > 5 && (
            <div
              style={{
                fontSize: 12,
                color: "#888",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              + {ordersEnCours.length - 5} autre
              {ordersEnCours.length - 5 > 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Bloc 3 : Stocks à commander */}
        <div
          style={{
            ...S.card,
            margin: 0,
            background: aCommander.length > 0 ? "#fff8f8" : "#f9fbe7",
            border: `1.5px solid ${
              aCommander.length > 0 ? "#ffcdd2" : "#dce775"
            }`,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: DARK,
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>🛒 À commander</span>
            <span
              style={{
                fontSize: 12,
                color: aCommander.length > 0 ? "#e53935" : "#7cb342",
                fontWeight: 700,
              }}
            >
              {aCommander.length > 0
                ? `${aCommander.length} urgents`
                : "Tout OK ✅"}
            </span>
          </div>
          {aCommander.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🟢</div>
              <div style={{ fontSize: 13, color: "#7cb342", fontWeight: 600 }}>
                Stocks suffisants pour toutes les commandes
              </div>
            </div>
          ) : (
            aCommander.map((ing, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid #ffcdd2",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: DARK }}>
                  🧂 {ing.name}
                </span>
                <span
                  style={{ fontWeight: 700, color: "#e53935", fontSize: 14 }}
                >
                  {ing.manque >= 1000
                    ? `${(ing.manque / 1000).toFixed(2)} kg`
                    : `${Math.round(ing.manque)} g`}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Bloc 4 : Vitrine du jour */}
        <div style={{ ...S.card, margin: 0 }}>
          <div
            style={{
              fontWeight: 700,
              color: DARK,
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>🏪 Vitrine du jour</span>
            <span style={{ fontSize: 12, color: "#f4a261", fontWeight: 700 }}>
              {totalVitrine} pièces
            </span>
          </div>
          {vitrineToday.length > 0 &&
            vitrineToday.map((v, i) => (
              <div
                key={i}
                style={{
                  fontSize: 13,
                  color: "#555",
                  padding: "4px 0",
                  borderBottom: "1px solid #fce4ec",
                }}
              >
                🍰 <b>{v.recipeName}</b> — {v.quantity} pcs
              </div>
            ))}
          {/* Ajout rapide vitrine */}
          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 8,
              alignItems: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 2, minWidth: 120 }}>
              <select
                style={{
                  ...S.input,
                  marginBottom: 0,
                  borderColor: "#f4a261",
                  fontSize: 13,
                }}
                value={vitrineRapide.recipe}
                onChange={(e) =>
                  setVitrineRapide((v) => ({ ...v, recipe: e.target.value }))
                }
              >
                <option value="">+ Ajouter en vitrine</option>
                {recipes.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 60 }}>
              <input
                style={{
                  ...S.input,
                  marginBottom: 0,
                  borderColor: "#f4a261",
                  fontSize: 13,
                  textAlign: "center",
                }}
                type="number"
                min="1"
                value={vitrineRapide.qty}
                onChange={(e) =>
                  setVitrineRapide((v) => ({ ...v, qty: e.target.value }))
                }
              />
            </div>
            <button
              style={{
                ...btn(),
                background: "#f4a261",
                padding: "9px 14px",
                fontSize: 13,
              }}
              onClick={addVitrine}
              disabled={!vitrineRapide.recipe}
            >
              ✓
            </button>
          </div>
        </div>
      </div>

      {/* Résumé financier du jour */}
      <div style={{ ...S.card }}>
        <div style={{ fontWeight: 700, color: DARK, marginBottom: 14 }}>
          💰 Résumé financier
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))",
            gap: 12,
          }}
        >
          {[
            {
              label: "CA commandes en cours",
              value:
                ordersEnCours
                  .reduce((s, o) => s + (o.price || 0), 0)
                  .toFixed(2) + " €",
              color: PINK,
            },
            {
              label: "Marge estimée",
              value:
                ordersEnCours
                  .reduce((s, o) => s + ((o.price || 0) - (o.cost || 0)), 0)
                  .toFixed(2) + " €",
              color: "#2e7d32",
            },
            {
              label: "Pièces en vitrine",
              value: `${totalVitrine}`,
              color: "#f4a261",
            },
            {
              label: "Tâches production",
              value: `${planningAujourdhui.filter((p) => p.done).length}/${
                planningAujourdhui.length
              }`,
              color: "#457b9d",
            },
          ].map((k, i) => (
            <div
              key={i}
              style={{
                background: "#F8FAFC",
                borderRadius: 12,
                padding: "12px 16px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: SLATE,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {k.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: k.color }}>
                {k.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── INGRÉDIENTS ───────────────────────────────────────────────────────────────
function IngredientsPage({ ingredients, setIngredients }) {
  const empty = { name: "", pricePerKg: "", stock: "" };
  const [form, setForm] = useState(empty);
  const [editIdx, setEditIdx] = useState(null);
  const [restock, setRestock] = useState({ idx: null, qty: "" });

  const f = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const save = () => {
    if (!form.name.trim()) return;
    const item = {
      name: form.name.trim(),
      pricePerKg: +form.pricePerKg || 0,
      stock: +form.stock || 0,
    };
    if (editIdx !== null) {
      setIngredients((prev) => prev.map((x, i) => (i === editIdx ? item : x)));
      setEditIdx(null);
    } else {
      setIngredients((prev) => [...prev, item]);
    }
    setForm(empty);
  };

  const startEdit = (idx) => {
    setEditIdx(idx);
    setForm({ ...ingredients[idx] });
  };
  const del = (idx) =>
    setIngredients((prev) => prev.filter((_, i) => i !== idx));

  const doRestock = () => {
    const qty = +restock.qty;
    if (!qty || restock.idx === null) return;
    setIngredients((prev) =>
      prev.map((x, i) =>
        i === restock.idx ? { ...x, stock: x.stock + qty } : x
      )
    );
    setRestock({ idx: null, qty: "" });
  };

  return (
    <div>
      <div style={S.card}>
        <div style={{ fontWeight: 700, color: DARK, marginBottom: 14 }}>
          {editIdx !== null ? "ing_edit" : "ing_add"}
        </div>
        <div style={S.row}>
          <div style={{ flex: 2 }}>
            <label style={S.label}>Nom</label>
            <input
              style={S.input}
              placeholder="Nom"
              value={form.name}
              onChange={(e) => f("name", e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Prix / kg (€)</label>
            <input
              style={S.input}
              type="number"
              placeholder="0"
              value={form.pricePerKg}
              onChange={(e) => f("pricePerKg", e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Stock initial (g)</label>
            <input
              style={S.input}
              type="number"
              placeholder="0"
              value={form.stock}
              onChange={(e) => f("stock", e.target.value)}
            />
          </div>
          <div>
            <button style={btn()} onClick={save}>
              {editIdx !== null ? "💾 Enregistrer" : "➕ Ajouter"}
            </button>
            {editIdx !== null && (
              <button
                style={{ ...btn(false), marginLeft: 8 }}
                onClick={() => {
                  setEditIdx(null);
                  setForm(empty);
                }}
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={S.card}>
        <div style={{ fontWeight: 700, color: DARK, marginBottom: 12 }}>
          📦 Liste des ingrédients
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={S.tableHead}>
              {[
                "Ingrédient",
                "Prix / kg",
                "Stock (g)",
                "Valeur stock",
                "État",
                "Actions",
              ].map((h) => (
                <th key={h} style={{ ...S.tableTd, textAlign: "left" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing, i) => {
              const low = ing.stock <= ALERT;
              const valeur = (ing.pricePerKg / 1000) * ing.stock;
              return (
                <tr
                  key={i}
                  style={{ background: low ? "#fff8f8" : "transparent" }}
                >
                  <td style={S.tableTd}>
                    <b>{ing.name}</b>
                  </td>
                  <td style={S.tableTd}>{ing.pricePerKg.toFixed(2) + " €"}</td>
                  <td style={{ ...S.tableTd, ...(low ? S.danger : S.ok) }}>
                    {ing.stock} g
                  </td>
                  <td style={S.tableTd}>{valeur.toFixed(2) + " €"}</td>
                  <td style={S.tableTd}>
                    <span
                      style={{
                        background: low ? "#ffebee" : "#e8f5e9",
                        color: low ? "#e53935" : "#2e7d32",
                        borderRadius: 8,
                        padding: "3px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {low ? "⚠️ Faible" : "✅ OK"}
                    </span>
                  </td>
                  <td style={S.tableTd}>
                    <div style={S.row}>
                      <button style={btn(false)} onClick={() => startEdit(i)}>
                        ✏️
                      </button>
                      <button
                        style={btn(false)}
                        onClick={() => setRestock({ idx: i, qty: "" })}
                      >
                        📦 Réappro
                      </button>
                      <button style={btn(false, true)} onClick={() => del(i)}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal réapprovisionnement */}
      {restock.idx !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#0006",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: 32,
              minWidth: 320,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: DARK,
                marginBottom: 16,
              }}
            >
              📦 Réapprovisionner : {ingredients[restock.idx]?.name}
            </div>
            <label style={S.label}>Quantité à ajouter (g)</label>
            <input
              style={S.input}
              type="number"
              placeholder="ex: 5000"
              value={restock.qty}
              onChange={(e) =>
                setRestock((r) => ({ ...r, qty: e.target.value }))
              }
            />
            <div style={S.row}>
              <button style={btn()} onClick={doRestock}>
                ✅ Confirmer
              </button>
              <button
                style={btn(false)}
                onClick={() => setRestock({ idx: null, qty: "" })}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── RECETTES ──────────────────────────────────────────────────────────────────
function RecipesPage({ recipes, setRecipes, ingredients, charges }) {
  const emptyForm = {
    name: "",
    portions: 10,
    lossPct: 10,
    laborHours: 0,
    hourlyRate: 0,
    marginCoef: 2.5,
    sellingPrice: 0,
    notes: "",
    category: "Autre",
    tva: 5.5,
  };
  const [form, setForm] = useState(emptyForm);
  const [selIng, setSelIng] = useState(
    ingredients.map((i) => ({ name: i.name, quantity: 0 }))
  );
  const [editIdx, setEditIdx] = useState(null);
  const [viewIdx, setViewIdx] = useState(null);
  const [showTTC, setShowTTC] = useLocalStorage("pm_show_ttc", false);

  // TVA rates pour boulangerie/pâtisserie France
  const TVA_RATES = [
    { label: "5,5% — Produits alimentaires", value: 5.5 },
    { label: "10% — Restauration / vente à emporter", value: 10 },
    { label: "20% — Taux normal", value: 20 },
    { label: "0% — Exonéré", value: 0 },
  ];

  useEffect(() => {
    setSelIng(ingredients.map((i) => ({ name: i.name, quantity: 0 })));
  }, [ingredients]);

  const f = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const chargesMensuel = charges
    .filter((c) => c.period === "Monthly" || c.period === "Mensuel")
    .reduce((s, c) => s + (c.amount || 0), 0);
  const unitsPerMonth = 300;
  const fixedPerUnit = chargesMensuel / unitsPerMonth;

  const ingCost = selIng.reduce((s, ing) => {
    const found = ingredients.find((i) => i.name === ing.name);
    return s + (found ? (found.pricePerKg / 1000) * (ing.quantity || 0) : 0);
  }, 0);
  const lossMultiplier = 1 + (+form.lossPct || 0) / 100;
  const laborCost = (+form.laborHours || 0) * (+form.hourlyRate || 0);
  const batchCost = ingCost * lossMultiplier + laborCost + fixedPerUnit;
  const costPerUnit = batchCost / (+form.portions || 1);
  const suggestedPrice = costPerUnit * (+form.marginCoef || 1);

  const save = () => {
    if (!form.name.trim()) return;
    const recipe = {
      name: form.name.trim(),
      category: form.category || "Autre",
      tva: +form.tva || 5.5,
      portions: +form.portions,
      lossPct: +form.lossPct,
      laborHours: +form.laborHours,
      hourlyRate: +form.hourlyRate,
      marginCoef: +form.marginCoef,
      notes: form.notes,
      ingredients: selIng.filter((i) => i.quantity > 0),
      costPerUnit,
      suggestedPrice,
    };
    if (editIdx !== null) {
      setRecipes((prev) => prev.map((r, i) => (i === editIdx ? recipe : r)));
      setEditIdx(null);
    } else {
      setRecipes((prev) => [...prev, recipe]);
    }
    setForm(emptyForm);
    setSelIng(ingredients.map((i) => ({ name: i.name, quantity: 0 })));
  };

  const startEdit = (idx) => {
    const r = recipes[idx];
    setForm({
      name: r.name,
      portions: r.portions,
      lossPct: r.lossPct,
      laborHours: r.laborHours,
      hourlyRate: r.hourlyRate,
      marginCoef: r.marginCoef,
      notes: r.notes || "",
      category: r.category || "Autre",
      tva: r.tva || 5.5,
    });
    setSelIng(
      ingredients.map((i) => {
        const found = r.ingredients?.find((x) => x.name === i.name);
        return { name: i.name, quantity: found ? found.quantity : 0 };
      })
    );
    setEditIdx(idx);
    setViewIdx(null);
  };

  const del = (idx) => setRecipes((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div>
      <div style={S.card}>
        <div style={{ fontWeight: 700, color: DARK, marginBottom: 14 }}>
          {editIdx !== null ? "rec_edit" : "rec_new"}
        </div>
        <div style={S.row}>
          <div style={{ flex: 3 }}>
            <label style={S.label}>Nom de la recette</label>
            <input
              style={S.input}
              placeholder="ex: Tarte au citron"
              value={form.name}
              onChange={(e) => f("name", e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Nombre de pièces</label>
            <input
              style={S.input}
              type="number"
              value={form.portions}
              onChange={(e) => f("portions", e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Catégorie</label>
            <div style={{ display: "flex", gap: 6 }}>
              <select
                style={{ ...S.input, marginBottom: 0, flex: 1 }}
                value={form.category}
                onChange={(e) => f("category", e.target.value)}
              >
                {(() => {
                  try {
                    const cats =
                      JSON.parse(localStorage.getItem("pm_categories")) ||
                      DEFAULT_CATEGORIES;
                    return cats.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ));
                  } catch {
                    return DEFAULT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ));
                  }
                })()}
              </select>
              <button
                type="button"
                title="Créer une catégorie"
                onClick={() => {
                  const name = prompt("Nom de la nouvelle catégorie :");
                  if (!name?.trim()) return;
                  const cats = (() => {
                    try {
                      return (
                        JSON.parse(localStorage.getItem("pm_categories")) ||
                        DEFAULT_CATEGORIES
                      );
                    } catch {
                      return DEFAULT_CATEGORIES;
                    }
                  })();
                  if (!cats.includes(name.trim())) {
                    const newCats = [...cats, name.trim()];
                    localStorage.setItem(
                      "pm_categories",
                      JSON.stringify(newCats)
                    );
                  }
                  f("category", name.trim());
                }}
                style={{
                  ...btn(false),
                  padding: "8px 12px",
                  fontSize: 16,
                  marginBottom: 8,
                  flexShrink: 0,
                }}
              >
                +
              </button>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Pertes (%)</label>
            <input
              style={S.input}
              type="number"
              value={form.lossPct}
              onChange={(e) => f("lossPct", e.target.value)}
            />
          </div>
        </div>
        <div style={S.row}>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Temps production (h)</label>
            <input
              style={S.input}
              type="number"
              value={form.laborHours}
              onChange={(e) => f("laborHours", e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Taux horaire (€)</label>
            <input
              style={S.input}
              type="number"
              value={form.hourlyRate}
              onChange={(e) => f("hourlyRate", e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Coefficient de marge</label>
            <input
              style={S.input}
              type="number"
              step="0.1"
              value={form.marginCoef}
              onChange={(e) => f("marginCoef", e.target.value)}
            />
          </div>
        </div>

        <div
          style={{
            fontWeight: 700,
            color: DARK,
            marginBottom: 10,
            marginTop: 8,
          }}
        >
          🧂 Ingrédients (quantité en g)
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
            gap: 10,
          }}
        >
          {selIng.map((ing, i) => (
            <div key={i}>
              <label style={S.label}>{ing.name}</label>
              <input
                style={S.input}
                type="number"
                placeholder="0 g"
                value={ing.quantity}
                onChange={(e) =>
                  setSelIng((prev) =>
                    prev.map((x, j) =>
                      j === i ? { ...x, quantity: +e.target.value } : x
                    )
                  )
                }
              />
            </div>
          ))}
        </div>

        <div
          style={{
            fontWeight: 700,
            color: DARK,
            marginBottom: 6,
            marginTop: 8,
          }}
        >
          Note
        </div>
        <textarea
          style={{ ...S.input, height: 60, resize: "vertical" }}
          placeholder="Note"
          value={form.notes}
          onChange={(e) => f("notes", e.target.value)}
        />

        {/* TVA */}
        <div style={{ marginTop: 8 }}>
          <label style={S.label}>Taux de TVA</label>
          <select
            style={S.input}
            value={form.tva}
            onChange={(e) => f("tva", +e.target.value)}
          >
            {TVA_RATES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Calculs HT/TTC */}
        <div
          style={{
            background: "#F1F5F9",
            borderRadius: 12,
            padding: "14px 18px",
            marginTop: 12,
          }}
        >
          {/* Toggle HT/TTC */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: SLATE }}>
              Affichage des prix
            </span>
            <div
              style={{
                display: "flex",
                background: "#E2E8F0",
                borderRadius: 8,
                padding: 3,
                gap: 3,
              }}
            >
              {["HT", "TTC"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setShowTTC(mode === "TTC")}
                  style={{
                    padding: "4px 14px",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    transition: "all .15s",
                    background:
                      (showTTC ? "TTC" : "HT") === mode
                        ? "#fff"
                        : "transparent",
                    color: (showTTC ? "TTC" : "HT") === mode ? NAVY : SLATE,
                    boxShadow:
                      (showTTC ? "TTC" : "HT") === mode
                        ? "0 1px 3px rgba(0,0,0,0.1)"
                        : "none",
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 12,
            }}
          >
            <Calc label="Coût ingrédients" value={ingCost.toFixed(2) + " €"} />
            <Calc
              label={`Coût total (×${form.portions})`}
              value={batchCost.toFixed(2) + " €"}
            />
            <Calc
              label="Coût / pièce HT"
              value={costPerUnit.toFixed(2) + " €"}
            />
            <Calc
              label={`Prix conseillé ${showTTC ? "TTC" : "HT"}`}
              value={
                (showTTC
                  ? suggestedPrice * (1 + (+form.tva || 0) / 100)
                  : suggestedPrice
                ).toFixed(2) + " €"
              }
              accent
            />
            {form.tva > 0 && (
              <Calc
                label={`TVA ${form.tva}% / pièce`}
                value={
                  ((suggestedPrice * (+form.tva || 0)) / 100).toFixed(2) + " €"
                }
              />
            )}
            <Calc
              label="Marge / pièce"
              value={(suggestedPrice - costPerUnit).toFixed(2) + " €"}
            />
          </div>

          {form.tva > 0 && (
            <div
              style={{
                marginTop: 12,
                padding: "8px 12px",
                background: "#EFF6FF",
                borderRadius: 8,
                fontSize: 12,
                color: ACCENT,
              }}
            >
              💡 Prix HT : <b>{suggestedPrice.toFixed(2)} €</b> → Prix TTC :{" "}
              <b>
                {(suggestedPrice * (1 + (+form.tva || 0) / 100)).toFixed(2)} €
              </b>{" "}
              (TVA {form.tva}%)
            </div>
          )}
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
          <button style={btn()} onClick={save}>
            {editIdx !== null ? "💾 Modifier" : "💾 Enregistrer"}
          </button>
          {editIdx !== null && (
            <button
              style={btn(false)}
              onClick={() => {
                setEditIdx(null);
                setForm(emptyForm);
                setSelIng(
                  ingredients.map((i) => ({ name: i.name, quantity: 0 }))
                );
              }}
            >
              Annuler
            </button>
          )}
        </div>
      </div>

      {/* ── RÉPERTOIRE ALPHABÉTIQUE ── */}
      {recipes.length > 0 && (
        <RecipeDirectory
          recipes={recipes}
          viewIdx={viewIdx}
          setViewIdx={setViewIdx}
          startEdit={startEdit}
          del={del}
        />
      )}
    </div>
  );
}

// ── RECIPE DIRECTORY ─────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  "Viennoiserie",
  "Entremets",
  "Pain",
  "Tarte",
  "Biscuit",
  "Chocolat",
  "Autre",
];

function RecipeDirectory({ recipes, viewIdx, setViewIdx, startEdit, del }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Toutes");
  const [activeLetter, setActiveLetter] = useState(null);
  const [customCats, setCustomCats] = useLocalStorage(
    "pm_categories",
    DEFAULT_CATEGORIES
  );
  const [newCat, setNewCat] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);

  const allCategories = ["Toutes", ...customCats];

  const addCategory = () => {
    const cat = newCat.trim();
    if (!cat || customCats.includes(cat)) return;
    setCustomCats((prev) => [...prev, cat]);
    setNewCat("");
    setShowAddCat(false);
  };

  const deleteCategory = (cat) => {
    if (DEFAULT_CATEGORIES.includes(cat)) return; // ne pas supprimer les catégories par défaut
    setCustomCats((prev) => prev.filter((c) => c !== cat));
    if (category === cat) setCategory("Toutes");
  };

  // Filter recipes
  const filtered = recipes.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      category === "Toutes" || (r.category || "Autre") === category;
    const matchLetter =
      !activeLetter || r.name.toUpperCase().startsWith(activeLetter);
    return matchSearch && matchCat && matchLetter;
  });

  // Group by first letter
  const grouped = filtered.reduce((acc, r, globalIdx) => {
    const letter = r.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push({ ...r, globalIdx: recipes.indexOf(r) });
    return acc;
  }, {});
  const letters = Object.keys(grouped).sort();

  // All letters present in recipes
  const availableLetters = [
    ...new Set(recipes.map((r) => r.name[0].toUpperCase())),
  ].sort();

  return (
    <div>
      {/* Header + Search */}
      <div style={{ ...S.card, marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ fontWeight: 700, color: NAVY, fontSize: 16 }}>
            📖 Répertoire des recettes
            <span
              style={{
                marginLeft: 8,
                background: "#EFF6FF",
                color: ACCENT,
                borderRadius: 99,
                padding: "2px 10px",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {filtered.length} / {recipes.length}
            </span>
          </div>
        </div>

        {/* Recherche */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: SLATE,
              fontSize: 16,
            }}
          >
            🔍
          </span>
          <input
            style={{ ...S.input, paddingLeft: 36, marginBottom: 0 }}
            placeholder="Rechercher une recette..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setActiveLetter(null);
            }}
          />
        </div>

        {/* Catégories */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 12,
            alignItems: "center",
          }}
        >
          {allCategories.map((cat) => (
            <div
              key={cat}
              style={{ display: "flex", alignItems: "center", gap: 2 }}
            >
              <button
                onClick={() => setCategory(cat)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 99,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  transition: "all .15s",
                  background: category === cat ? ACCENT : "#F1F5F9",
                  color: category === cat ? "#fff" : SLATE,
                }}
              >
                {cat}
              </button>
              {cat !== "Toutes" && !DEFAULT_CATEGORIES.includes(cat) && (
                <button
                  onClick={() => deleteCategory(cat)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: SLATE2,
                    fontSize: 12,
                    padding: "0 2px",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {/* Ajouter une catégorie */}
          {showAddCat ? (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                style={{
                  ...S.input,
                  marginBottom: 0,
                  width: 140,
                  padding: "5px 10px",
                  fontSize: 13,
                }}
                placeholder="Nouvelle catégorie"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCategory()}
                autoFocus
              />
              <button
                onClick={addCategory}
                style={{ ...btn(), padding: "5px 12px", fontSize: 12 }}
              >
                ✓
              </button>
              <button
                onClick={() => {
                  setShowAddCat(false);
                  setNewCat("");
                }}
                style={{ ...btn(false), padding: "5px 12px", fontSize: 12 }}
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddCat(true)}
              style={{
                padding: "5px 14px",
                borderRadius: 99,
                border: `1px dashed ${BORDER}`,
                background: "transparent",
                cursor: "pointer",
                fontSize: 12,
                color: SLATE,
              }}
            >
              + Catégorie
            </button>
          )}
        </div>

        {/* Index alphabétique */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveLetter(null)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              background: !activeLetter ? NAVY : "#F1F5F9",
              color: !activeLetter ? "#fff" : SLATE,
            }}
          >
            All
          </button>
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => (
            <button
              key={l}
              onClick={() => setActiveLetter(activeLetter === l ? null : l)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                transition: "all .15s",
                background:
                  activeLetter === l
                    ? ACCENT
                    : availableLetters.includes(l)
                    ? "#F1F5F9"
                    : "transparent",
                color:
                  activeLetter === l
                    ? "#fff"
                    : availableLetters.includes(l)
                    ? NAVY
                    : SLATE2,
                opacity: availableLetters.includes(l) ? 1 : 0.3,
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Résultats groupés par lettre */}
      {filtered.length === 0 ? (
        <div
          style={{ ...S.card, textAlign: "center", padding: 40, color: SLATE }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          <div>Aucune recette trouvée</div>
        </div>
      ) : (
        letters.map((letter) => (
          <div key={letter} style={{ marginBottom: 8 }}>
            {/* Lettre index */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
                padding: "4px 0",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: NAVY,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: 18,
                  flexShrink: 0,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {letter}
              </div>
              <div style={{ flex: 1, height: 1, background: BORDER }} />
              <span style={{ fontSize: 12, color: SLATE2 }}>
                {grouped[letter].length} recette
                {grouped[letter].length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Cards recettes */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 10,
                marginBottom: 8,
              }}
            >
              {grouped[letter].map((r) => (
                <div
                  key={r.globalIdx}
                  style={{
                    background: CARD_BG,
                    borderRadius: 12,
                    border: `1px solid ${
                      viewIdx === r.globalIdx ? ACCENT : BORDER
                    }`,
                    padding: "16px 20px",
                    cursor: "pointer",
                    transition: "all .15s",
                    boxShadow:
                      viewIdx === r.globalIdx
                        ? `0 0 0 3px ${ACCENT}20`
                        : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: NAVY,
                          fontSize: 15,
                          marginBottom: 4,
                        }}
                      >
                        {r.name}
                      </div>
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        {r.category && (
                          <span
                            style={{
                              background: "#EFF6FF",
                              color: ACCENT,
                              borderRadius: 99,
                              padding: "2px 8px",
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            {r.category}
                          </span>
                        )}
                        <span
                          style={{
                            background: "#F0FDF4",
                            color: SUCCESS,
                            borderRadius: 99,
                            padding: "2px 8px",
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {(r.suggestedPrice || 0).toFixed(2)} € HT
                          {r.tva > 0 &&
                            ` · ${(
                              r.suggestedPrice * (1 + r.tva / 100) || 0
                            ).toFixed(2)} € TTC`}
                        </span>
                        <span
                          style={{
                            background: "#F8FAFC",
                            color: SLATE,
                            borderRadius: 99,
                            padding: "2px 8px",
                            fontSize: 11,
                          }}
                        >
                          {r.portions} pcs · ×{r.marginCoef}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
                      <button
                        style={{
                          ...btn(viewIdx === r.globalIdx),
                          padding: "6px 10px",
                          fontSize: 14,
                        }}
                        onClick={() =>
                          setViewIdx(
                            viewIdx === r.globalIdx ? null : r.globalIdx
                          )
                        }
                      >
                        {viewIdx === r.globalIdx ? "✕" : "👁️"}
                      </button>
                      <button
                        style={{
                          ...btn(false),
                          padding: "6px 10px",
                          fontSize: 14,
                        }}
                        onClick={() => startEdit(r.globalIdx)}
                      >
                        ✏️
                      </button>
                      <button
                        style={{
                          ...btn(false, true),
                          padding: "6px 10px",
                          fontSize: 14,
                        }}
                        onClick={() => del(r.globalIdx)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Fiche détaillée si ouverte */}
                  {viewIdx === r.globalIdx && (
                    <div
                      style={{
                        marginTop: 16,
                        paddingTop: 16,
                        borderTop: `1px solid ${BORDER}`,
                      }}
                    >
                      <RecipeScaler recipe={r} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function Calc({ label, value, accent }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: SLATE, fontWeight: 600 }}>{label}</div>
      <div
        style={{ fontSize: 17, fontWeight: 900, color: accent ? PINK : DARK }}
      >
        {value}
      </div>
    </div>
  );
}

// ── RECIPE SCALER ─────────────────────────────────────────────────────────────
function RecipeScaler({ recipe }) {
  const [target, setTarget] = useState(recipe.portions);

  const ratio = (+target || recipe.portions) / (recipe.portions || 1);

  const printFiche = () => {
    const win = window.open("", "_blank");
    const ingredients = recipe.ingredients?.filter((i) => i.quantity > 0) || [];
    const r = +target || recipe.portions;
    win.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Fiche recette — ${recipe.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Georgia', serif; padding: 40px; color: #1a1a2e; max-width: 720px; margin: 0 auto; }
          .header { border-bottom: 3px solid #0F2044; padding-bottom: 20px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 32px; font-weight: 700; color: #0F2044; }
          .category { font-size: 13px; color: #64748B; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.1em; }
          .brand { font-size: 13px; color: #94A3B8; }
          .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
          .meta-card { background: #F8FAFC; border-radius: 10px; padding: 14px; text-align: center; border: 1px solid #E2E8F0; }
          .meta-label { font-size: 10px; color: #64748B; text-transform: uppercase; letter-spacing: 0.08em; font-family: sans-serif; margin-bottom: 4px; }
          .meta-value { font-size: 22px; font-weight: 700; color: #0F2044; }
          .section-title { font-size: 14px; font-weight: 700; color: #0F2044; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px; font-family: sans-serif; border-left: 4px solid #2563EB; padding-left: 10px; }
          .ingredients { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 28px; }
          .ing-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0; font-family: sans-serif; }
          .ing-name { font-size: 14px; color: #1a1a2e; }
          .ing-qty { font-size: 14px; font-weight: 700; color: #2563EB; }
          .costs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 28px; }
          .cost-card { background: #0F2044; color: white; border-radius: 10px; padding: 14px; text-align: center; }
          .cost-label { font-size: 10px; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.08em; font-family: sans-serif; margin-bottom: 4px; }
          .cost-value { font-size: 20px; font-weight: 700; }
          .notes-box { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; padding: 16px; font-size: 14px; color: #78350F; line-height: 1.7; font-style: italic; }
          .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8; font-family: sans-serif; display: flex; justify-content: space-between; }
          .badge { display: inline-block; background: #EFF6FF; color: #2563EB; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-family: sans-serif; font-weight: 600; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">${recipe.name}</div>
            <div class="category">${recipe.category || "Recette"} ${
      ratio !== 1 ? `· Adapté pour ${r} pièces` : ""
    }</div>
          </div>
          <div style="text-align:right">
            <div class="brand">🍞 Knead</div>
            <div style="font-size:11px;color:#94A3B8;margin-top:2px;">${new Date().toLocaleDateString(
              "fr-FR"
            )}</div>
          </div>
        </div>

        <div class="meta">
          <div class="meta-card">
            <div class="meta-label">Portions</div>
            <div class="meta-value">${r}</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">Pertes</div>
            <div class="meta-value">${recipe.lossPct}%</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">Temps</div>
            <div class="meta-value">${recipe.laborHours}h</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">Coeff.</div>
            <div class="meta-value">×${recipe.marginCoef}</div>
          </div>
        </div>

        <div class="section-title">🧂 Ingrédients</div>
        <div class="ingredients">
          ${ingredients
            .map((ing) => {
              const scaled = ing.quantity * ratio;
              const display =
                scaled >= 1000
                  ? `${(scaled / 1000).toFixed(2)} kg`
                  : `${Math.round(scaled)} g`;
              return `<div class="ing-row"><span class="ing-name">${ing.name}</span><span class="ing-qty">${display}</span></div>`;
            })
            .join("")}
        </div>

        <div class="section-title">💰 Coûts & Prix</div>
        <div class="costs">
          <div class="cost-card">
            <div class="cost-label">Coût / pièce</div>
            <div class="cost-value">${(recipe.costPerUnit || 0).toFixed(
              2
            )} €</div>
          </div>
          <div class="cost-card">
            <div class="cost-label">Prix conseillé</div>
            <div class="cost-value">${(recipe.suggestedPrice || 0).toFixed(
              2
            )} €</div>
          </div>
          <div class="cost-card">
            <div class="cost-label">Marge / pièce</div>
            <div class="cost-value">${(
              (recipe.suggestedPrice || 0) - (recipe.costPerUnit || 0)
            ).toFixed(2)} €</div>
          </div>
        </div>

        ${
          recipe.notes
            ? `
        <div class="section-title">📝 Notes</div>
        <div class="notes-box">${recipe.notes}</div>
        `
            : ""
        }

        <div class="footer">
          <span>Fiche générée par Knead · Bakery Management</span>
          <span>${
            ratio !== 1
              ? `Base : ${
                  recipe.portions
                } pcs · Adapté : ${r} pcs (×${ratio.toFixed(2)})`
              : `Recette de base : ${recipe.portions} pcs`
          }</span>
        </div>
        <script>window.onload = () => window.print();<\/script>
      </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div
      style={{
        background: "#F8FAFC",
        borderRadius: 14,
        padding: 20,
        marginTop: 14,
        border: `1px solid ${BORDER}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <b style={{ color: DARK, fontSize: 15 }}>
          📋 {recipe.name} — Calculateur de portions
        </b>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={printFiche}
            style={{
              ...btn(false),
              padding: "6px 14px",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            🖨️ Imprimer la fiche
          </button>
          <span style={{ fontSize: 13, color: SLATE, fontWeight: 600 }}>
            Recette de base :
          </span>
          <span
            style={{
              background: "#F1F5F9",
              color: DARK,
              borderRadius: 8,
              padding: "4px 12px",
              fontWeight: 700,
            }}
          >
            {recipe.portions} pièces
          </span>
          <span style={{ fontSize: 13, color: SLATE, fontWeight: 600 }}>
            → Je veux :
          </span>
          <input
            type="number"
            min="1"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            style={{
              width: 90,
              padding: "7px 12px",
              borderRadius: 10,
              border: "2px solid " + PINK,
              fontSize: 15,
              fontWeight: 700,
              color: DARK,
              outline: "none",
              textAlign: "center",
            }}
          />
          <span style={{ fontSize: 13, color: SLATE, fontWeight: 600 }}>
            pièces
          </span>
        </div>
      </div>

      {/* Ratio badge */}
      <div style={{ marginBottom: 14 }}>
        <span
          style={{
            background: ratio === 1 ? "#e8f5e9" : "#fff8e1",
            color: ratio === 1 ? "#2e7d32" : "#f57f17",
            borderRadius: 8,
            padding: "4px 14px",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {ratio === 1
            ? "✅ Recette de base"
            : `× ${ratio
                .toFixed(3)
                .replace(/\.?0+$/, "")} par rapport à la base`}
        </span>
      </div>

      {/* Ingrédients scalés */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {recipe.ingredients
          ?.filter((i) => i.quantity > 0)
          .map((ing, i) => {
            const scaled = ing.quantity * ratio;
            const display =
              scaled >= 1000
                ? `${(scaled / 1000).toFixed(3).replace(/\.?0+$/, "")} kg`
                : `${Math.round(scaled)} g`;
            return (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 10,
                  padding: "12px 16px",
                  border: "1px solid #f8bbd0",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: SLATE,
                    fontWeight: 600,
                    marginBottom: 2,
                  }}
                >
                  🧂 {ing.name}
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: DARK }}>
                  {display}
                </div>
                {ratio !== 1 && (
                  <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>
                    base : {ing.quantity} g
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Coûts scalés */}
      <div
        style={{
          background: "#F1F5F9",
          borderRadius: 12,
          padding: "12px 18px",
          display: "flex",
          gap: 28,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: SLATE, fontWeight: 600 }}>
            Coût total batch
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: DARK }}>
            {((recipe.costPerUnit || 0) * +target).toFixed(2)} €
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: SLATE, fontWeight: 600 }}>
            Coût / pièce
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: DARK }}>
            {(recipe.costPerUnit || 0).toFixed(2) + " €"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: SLATE, fontWeight: 600 }}>
            Prix de vente conseillé (total)
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: PINK }}>
            {((recipe.suggestedPrice || 0) * +target).toFixed(2)} €
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: SLATE, fontWeight: 600 }}>
            Marge estimée
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#2e7d32" }}>
            {(
              ((recipe.suggestedPrice || 0) - (recipe.costPerUnit || 0)) *
              +target
            ).toFixed(2)}{" "}
            €
          </div>
        </div>
      </div>

      {recipe.notes && (
        <div style={{ marginTop: 12, fontSize: 13, color: "#888" }}>
          📝 {recipe.notes}
        </div>
      )}
    </div>
  );
}

// ── COMMANDES ─────────────────────────────────────────────────────────────────
function OrdersPage({
  orders,
  setOrders,
  recipes,
  ingredients,
  setIngredients,
}) {
  const [sel, setSel] = useState("");
  const [qty, setQty] = useState(1);
  const [client, setClient] = useState("");
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState("all");

  const recipe = recipes.find((r) => r.name === sel);

  const add = () => {
    if (!recipe) return;
    const order = {
      recipeName: recipe.name,
      quantity: +qty,
      price: recipe.suggestedPrice * +qty,
      cost: recipe.costPerUnit * +qty,
      client: client.trim() || "—",
      note: note.trim(),
      date: new Date().toLocaleDateString("fr-FR"),
      status: "En cours",
    };
    // Déduire du stock
    recipe.ingredients?.forEach((ing) => {
      setIngredients((prev) =>
        prev.map((i) =>
          i.name === ing.name
            ? { ...i, stock: Math.max(0, i.stock - ing.quantity * +qty) }
            : i
        )
      );
    });
    setOrders((prev) => [...prev, order]);
    setSel("");
    setQty(1);
    setClient("");
    setNote("");
  };

  const toggleStatus = (idx) => {
    setOrders((prev) =>
      prev.map((o, i) =>
        i === idx
          ? { ...o, status: o.status === "En cours" ? "Livré" : "En cours" }
          : o
      )
    );
  };
  const del = (idx) => setOrders((prev) => prev.filter((_, i) => i !== idx));

  const shown =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div style={S.card}>
        <div style={{ fontWeight: 700, color: DARK, marginBottom: 14 }}>
          ➕ Nouvelle commande
        </div>
        <div style={S.row}>
          <div style={{ flex: 2 }}>
            <label style={S.label}>Recette</label>
            <select
              style={S.input}
              value={sel}
              onChange={(e) => setSel(e.target.value)}
            >
              <option value="">
                {"Bonjour" === "Bonjour" ? "— Choisir —" : "— Select —"}
              </option>
              {recipes.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name} ({(r.suggestedPrice || 0).toFixed(2) + " €"} / pièce)
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Quantité</label>
            <input
              style={S.input}
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>
          <div style={{ flex: 2 }}>
            <label style={S.label}>Client</label>
            <input
              style={S.input}
              placeholder="Client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
            />
          </div>
        </div>
        {recipe && (
          <div
            style={{
              background: "#F1F5F9",
              borderRadius: 10,
              padding: "10px 16px",
              marginBottom: 10,
              display: "flex",
              gap: 24,
              fontSize: 13,
            }}
          >
            <span>
              💰 Prix total :{" "}
              <b>{(recipe.suggestedPrice * qty).toFixed(2) + " €"}</b>
            </span>
            <span>
              💸 Coût : <b>{(recipe.costPerUnit * qty).toFixed(2) + " €"}</b>
            </span>
            <span style={S.ok}>
              📈 Marge :{" "}
              <b>
                {((recipe.suggestedPrice - recipe.costPerUnit) * qty).toFixed(
                  2
                )}{" "}
                €
              </b>
            </span>
          </div>
        )}
        <input
          style={S.input}
          placeholder="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button style={btn()} onClick={add} disabled={!recipe}>
          ✅ Enregistrer la commande
        </button>
      </div>

      <div style={S.card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <div style={{ fontWeight: 700, color: DARK }}>
            🛒 Commandes ({orders.length})
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["all", "En cours", "Livré"].map((f) => (
              <button
                key={f}
                style={btn(filter === f)}
                onClick={() => setFilter(f)}
              >
                {f === "all"
                  ? "Toutes"
                  : f === "En cours"
                  ? "En cours"
                  : "Livré"}
              </button>
            ))}
          </div>
        </div>
        {shown.length === 0 ? (
          <p style={{ color: "#bbb" }}>Aucune donnée.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={S.tableHead}>
                {[
                  "Recette",
                  "Client",
                  "Qté",
                  "Prix",
                  "Marge",
                  "Date",
                  "Statut",
                  "",
                ].map((h) => (
                  <th key={h} style={{ ...S.tableTd, textAlign: "left" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((o, i) => (
                <tr key={i}>
                  <td style={S.tableTd}>
                    <b>{o.recipeName}</b>
                  </td>
                  <td style={S.tableTd}>{o.client}</td>
                  <td style={S.tableTd}>{o.quantity}</td>
                  <td style={S.tableTd}>{(o.price || 0).toFixed(2) + " €"}</td>
                  <td style={{ ...S.tableTd, ...S.ok }}>
                    {((o.price || 0) - (o.cost || 0)).toFixed(2)} €
                  </td>
                  <td style={{ ...S.tableTd, color: "#888", fontSize: 12 }}>
                    {o.date}
                  </td>
                  <td style={S.tableTd}>
                    <span
                      style={{
                        background:
                          o.status === "Livré" ? "#e8f5e9" : "#fff9c4",
                        color: o.status === "Livré" ? "#2e7d32" : "#f57f17",
                        borderRadius: 8,
                        padding: "3px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td style={S.tableTd}>
                    <div style={S.row}>
                      <button
                        style={btn(false)}
                        onClick={() => toggleStatus(orders.indexOf(o))}
                      >
                        🔄
                      </button>
                      <button
                        style={btn(false, true)}
                        onClick={() => del(orders.indexOf(o))}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── PLANNING ──────────────────────────────────────────────────────────────────
function PlanningPage({ planning, setPlanning, recipes }) {
  const empty = { date: "", recipe: "", quantity: 1, note: "", done: false };
  const [form, setForm] = useState(empty);
  const f = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const add = () => {
    if (!form.date || !form.recipe) return;
    setPlanning((prev) => [...prev, { ...form, quantity: +form.quantity }]);
    setForm(empty);
  };
  const toggle = (idx) =>
    setPlanning((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, done: !p.done } : p))
    );
  const del = (idx) => setPlanning((prev) => prev.filter((_, i) => i !== idx));

  const sorted = [...planning].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <div style={S.card}>
        <div style={{ fontWeight: 700, color: DARK, marginBottom: 14 }}>
          📅 Ajouter une tâche de production
        </div>
        <div style={S.row}>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Date</label>
            <input
              style={S.input}
              type="date"
              value={form.date}
              onChange={(e) => f("date", e.target.value)}
            />
          </div>
          <div style={{ flex: 2 }}>
            <label style={S.label}>Recette à produire</label>
            <select
              style={S.input}
              value={form.recipe}
              onChange={(e) => f("recipe", e.target.value)}
            >
              <option value="">
                {"Bonjour" === "Bonjour" ? "— Choisir —" : "— Select —"}
              </option>
              {recipes.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Quantité (pièces)</label>
            <input
              style={S.input}
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => f("quantity", e.target.value)}
            />
          </div>
        </div>
        <input
          style={S.input}
          placeholder="Note"
          value={form.note}
          onChange={(e) => f("note", e.target.value)}
        />
        <button style={btn()} onClick={add}>
          ➕ Planifier
        </button>
      </div>

      <div style={S.card}>
        <div style={{ fontWeight: 700, color: DARK, marginBottom: 12 }}>
          📆 Planning de production
        </div>
        {sorted.length === 0 ? (
          <p style={{ color: "#bbb" }}>Aucune tâche planifiée.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={S.tableHead}>
                {["Date", "Recette", "Qté", "Note", "Statut", ""].map((h) => (
                  <th key={h} style={{ ...S.tableTd, textAlign: "left" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => (
                <tr key={i} style={{ opacity: p.done ? 0.5 : 1 }}>
                  <td style={S.tableTd}>
                    {new Date(p.date).toLocaleDateString("fr-FR")}
                  </td>
                  <td style={S.tableTd}>
                    <b>{p.recipe}</b>
                  </td>
                  <td style={S.tableTd}>{p.quantity} pièces</td>
                  <td style={{ ...S.tableTd, color: "#888", fontSize: 12 }}>
                    {p.note || "—"}
                  </td>
                  <td style={S.tableTd}>
                    <span
                      style={{
                        background: p.done ? "#e8f5e9" : "#fff9c4",
                        color: p.done ? "#2e7d32" : "#f57f17",
                        borderRadius: 8,
                        padding: "3px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {p.done ? "✅ Fait" : "⏳ À faire"}
                    </span>
                  </td>
                  <td style={S.tableTd}>
                    <div style={S.row}>
                      <button style={btn(false)} onClick={() => toggle(i)}>
                        {p.done ? "↩️" : "✅"}
                      </button>
                      <button style={btn(false, true)} onClick={() => del(i)}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── CHARGES ───────────────────────────────────────────────────────────────────
function ChargesPage({ charges, setCharges }) {
  const empty = { name: "", amount: "", period: "Mensuel" };
  const [form, setForm] = useState(empty);
  const f = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const add = () => {
    if (!form.name.trim() || !form.amount) return;
    setCharges((prev) => [...prev, { ...form, amount: +form.amount }]);
    setForm(empty);
  };
  const del = (idx) => setCharges((prev) => prev.filter((_, i) => i !== idx));

  const mensuel = charges
    .filter((c) => c.period === "Monthly" || c.period === "Mensuel")
    .reduce((s, c) => s + c.amount, 0);
  const annuel = charges.reduce(
    (s, c) =>
      s +
      c.amount *
        (c.period === "Monthly" || c.period === "Mensuel"
          ? 12
          : c.period === "Weekly" ||
            c.period === "Hebdo" ||
            c.period === "Weekly"
          ? 52
          : 1),
    0
  );

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
          marginBottom: 16,
        }}
      >
        <KPI title="💳 Charges mensuelles" value={mensuel.toFixed(2) + " €"} />
        <KPI
          title="📆 Charges annuelles estimées"
          value={annuel.toFixed(2) + " €"}
          accent={ACCENT}
        />
      </div>

      <div style={S.card}>
        <div style={{ fontWeight: 700, color: DARK, marginBottom: 14 }}>
          ➕ Ajouter une charge
        </div>
        <div style={S.row}>
          <div style={{ flex: 2 }}>
            <label style={S.label}>chg_name</label>
            <input
              style={S.input}
              placeholder="Désignation"
              value={form.name}
              onChange={(e) => f("name", e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>chg_amount</label>
            <input
              style={S.input}
              type="number"
              placeholder="0"
              value={form.amount}
              onChange={(e) => f("amount", e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Fréquence</label>
            <select
              style={S.input}
              value={form.period}
              onChange={(e) => f("period", e.target.value)}
            >
              <option value="Mensuel">Mensuel</option>
              <option value="Annuel">Annuel</option>
              <option value="Hebdo">Hebdomadaire</option>
            </select>
          </div>
          <div>
            <button style={btn()} onClick={add}>
              ➕ Ajouter
            </button>
          </div>
        </div>
      </div>

      <div style={S.card}>
        <div style={{ fontWeight: 700, color: DARK, marginBottom: 12 }}>
          💳 Charges ({charges.length})
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={S.tableHead}>
              {["Charge", "Montant", "Fréquence", "Équiv. mensuel", ""].map(
                (h) => (
                  <th key={h} style={{ ...S.tableTd, textAlign: "left" }}>
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {charges.map((c, i) => {
              const equiv =
                c.period === "Annual" || c.period === "Annuel"
                  ? c.amount / 12
                  : c.period === "Weekly" || c.period === "Hebdo"
                  ? c.amount * 4.33
                  : c.amount;
              return (
                <tr key={i}>
                  <td style={S.tableTd}>
                    <b>{c.name}</b>
                  </td>
                  <td style={S.tableTd}>{c.amount.toFixed(2) + " €"}</td>
                  <td style={S.tableTd}>{c.period}</td>
                  <td style={S.tableTd}>{equiv.toFixed(2) + " €"}</td>
                  <td style={S.tableTd}>
                    <button style={btn(false, true)} onClick={() => del(i)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── PERTES ────────────────────────────────────────────────────────────────────
function PertesPage({
  pertes,
  setPertes,
  ingredients,
  setIngredients,
  recipes,
}) {
  const empty = {
    type: "ingredient",
    name: "",
    quantity: 0,
    reason: "",
    date: "",
  };
  const [form, setForm] = useState(empty);
  const f = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const options = form.type === "ingredient" ? ingredients : recipes;

  const calcCost = () => {
    if (form.type === "ingredient") {
      const ing = ingredients.find((i) => i.name === form.name);
      return ing ? (ing.pricePerKg / 1000) * +form.quantity : 0;
    } else {
      const rec = recipes.find((r) => r.name === form.name);
      return rec ? rec.costPerUnit * +form.quantity : 0;
    }
  };

  const add = () => {
    if (!form.name || !form.quantity) return;
    const cost = calcCost();
    setPertes((prev) => [
      ...prev,
      {
        ...form,
        cost,
        date: form.date || new Date().toLocaleDateString("fr-FR"),
      },
    ]);
    // Déduire du stock si ingrédient
    if (form.type === "ingredient") {
      setIngredients((prev) =>
        prev.map((i) =>
          i.name === form.name
            ? { ...i, stock: Math.max(0, i.stock - +form.quantity) }
            : i
        )
      );
    }
    setForm(empty);
  };

  const del = (idx) => setPertes((prev) => prev.filter((_, i) => i !== idx));
  const totalPertes = pertes.reduce((s, p) => s + (p.cost || 0), 0);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <KPI
          title="🗑️ Total pertes enregistrées"
          value={totalPertes.toFixed(2) + " €"}
          accent={DANGER}
        />
      </div>

      <div style={S.card}>
        <div style={{ fontWeight: 700, color: DARK, marginBottom: 14 }}>
          ➕ Déclarer une perte
        </div>
        <div style={S.row}>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Type</label>
            <select
              style={S.input}
              value={form.type}
              onChange={(e) => f("type", e.target.value)}
            >
              <option value="ingredient">Ingrédient</option>
              <option value="recipe">Produit fini</option>
            </select>
          </div>
          <div style={{ flex: 2 }}>
            <label style={S.label}>
              {form.type === "ingredient" ? "Ingrédient" : "Recette"}
            </label>
            <select
              style={S.input}
              value={form.name}
              onChange={(e) => f("name", e.target.value)}
            >
              <option value="">
                {"Bonjour" === "Bonjour" ? "— Choisir —" : "— Select —"}
              </option>
              {options.map((o) => (
                <option key={o.name} value={o.name}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>
              {form.type === "ingredient" ? "Quantité (g)" : "Nb pièces"}
            </label>
            <input
              style={S.input}
              type="number"
              min="0"
              value={form.quantity}
              onChange={(e) => f("quantity", e.target.value)}
            />
          </div>
        </div>
        <div style={S.row}>
          <div style={{ flex: 2 }}>
            <label style={S.label}>Raison</label>
            <input
              style={S.input}
              placeholder="Raison"
              value={form.reason}
              onChange={(e) => f("reason", e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Date</label>
            <input
              style={S.input}
              type="date"
              value={form.date}
              onChange={(e) => f("date", e.target.value)}
            />
          </div>
        </div>
        {form.name && form.quantity > 0 && (
          <div
            style={{
              background: "#ffebee",
              borderRadius: 10,
              padding: "8px 14px",
              marginBottom: 8,
              fontSize: 13,
            }}
          >
            💸 Coût estimé de cette perte :{" "}
            <b style={S.danger}>{calcCost().toFixed(2) + " €"}</b>
          </div>
        )}
        <button style={btn()} onClick={add}>
          🗑️ Enregistrer la perte
        </button>
      </div>

      <div style={S.card}>
        <div style={{ fontWeight: 700, color: DARK, marginBottom: 12 }}>
          🗑️ Historique des pertes
        </div>
        {pertes.length === 0 ? (
          <p style={{ color: "#bbb" }}>Aucune perte enregistrée.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={S.tableHead}>
                {["Date", "Type", "Nom", "Quantité", "Coût", "Raison", ""].map(
                  (h) => (
                    <th key={h} style={{ ...S.tableTd, textAlign: "left" }}>
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {[...pertes].reverse().map((p, i) => (
                <tr key={i}>
                  <td style={{ ...S.tableTd, color: "#888", fontSize: 12 }}>
                    {p.date}
                  </td>
                  <td style={S.tableTd}>
                    {p.type === "ingredient" ? "🧂 Ingrédient" : "🍰 Produit"}
                  </td>
                  <td style={S.tableTd}>
                    <b>{p.name}</b>
                  </td>
                  <td style={S.tableTd}>
                    {p.quantity} {p.type === "ingredient" ? "g" : "pcs"}
                  </td>
                  <td style={{ ...S.tableTd, ...S.danger }}>
                    {(p.cost || 0).toFixed(2) + " €"}
                  </td>
                  <td style={{ ...S.tableTd, color: "#888" }}>
                    {p.reason || "—"}
                  </td>
                  <td style={S.tableTd}>
                    <button
                      style={btn(false, true)}
                      onClick={() => del(pertes.length - 1 - i)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── VITRINE QUICK ADD (widget dashboard) ─────────────────────────────────────
function VitrineQuickAdd({
  recipes,
  ingredients,
  setIngredients,
  vitrine,
  setVitrine,
  today,
}) {
  const [sel, setSel] = useState("");
  const [qty, setQty] = useState(1);

  const add = () => {
    const recipe = recipes.find((r) => r.name === sel);
    if (!recipe || !qty) return;
    recipe.ingredients?.forEach((ing) => {
      setIngredients((prev) =>
        prev.map((i) =>
          i.name === ing.name
            ? { ...i, stock: Math.max(0, i.stock - ing.quantity * +qty) }
            : i
        )
      );
    });
    setVitrine((prev) => [
      ...prev,
      { date: today, recipeName: recipe.name, quantity: +qty },
    ]);
    setSel("");
    setQty(1);
  };

  if (recipes.length === 0) return null;

  return (
    <div
      style={{
        ...S.card,
        background: "#fff8f0",
        border: "1.5px solid #f4a261",
        marginBottom: 16,
      }}
    >
      <div style={{ fontWeight: 700, color: "#b5530a", marginBottom: 12 }}>
        🏪 Mise en vitrine — Aujourd'hui
      </div>
      <div style={S.row}>
        <div style={{ flex: 2 }}>
          <label style={{ ...S.label, color: "#b5530a" }}>Recette</label>
          <select
            style={{ ...S.input, borderColor: "#f4a261" }}
            value={sel}
            onChange={(e) => setSel(e.target.value)}
          >
            <option value="">
              {"Bonjour" === "Bonjour"
                ? "— Choisir une recette —"
                : "— Select recipe —"}
            </option>
            {recipes.map((r) => (
              <option key={r.name} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ ...S.label, color: "#b5530a" }}>
            Nombre de pièces
          </label>
          <input
            style={{ ...S.input, borderColor: "#f4a261" }}
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </div>
        <div>
          <button
            style={{ ...btn(), background: "#f4a261" }}
            onClick={add}
            disabled={!sel}
          >
            ➕ Mettre en vitrine
          </button>
        </div>
      </div>
    </div>
  );
}

// ── VITRINE PAGE ──────────────────────────────────────────────────────────────
function VitrinePage({
  vitrine,
  setVitrine,
  recipes,
  ingredients,
  setIngredients,
  today,
}) {
  const [sel, setSel] = useState("");
  const [qty, setQty] = useState(1);
  const [dateFilter, setDateFilter] = useState(today);

  const add = () => {
    const recipe = recipes.find((r) => r.name === sel);
    if (!recipe || !qty) return;
    recipe.ingredients?.forEach((ing) => {
      setIngredients((prev) =>
        prev.map((i) =>
          i.name === ing.name
            ? { ...i, stock: Math.max(0, i.stock - ing.quantity * +qty) }
            : i
        )
      );
    });
    setVitrine((prev) => [
      ...prev,
      { date: today, recipeName: recipe.name, quantity: +qty },
    ]);
    setSel("");
    setQty(1);
  };

  const del = (globalIdx) =>
    setVitrine((prev) => prev.filter((_, i) => i !== globalIdx));

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const total = vitrine
      .filter((v) => v.date === key)
      .reduce((s, v) => s + v.quantity, 0);
    return {
      name: d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }),
      Gâteaux: total,
    };
  });

  const filtered = vitrine.filter((v) => v.date === dateFilter);
  const totalFiltré = filtered.reduce((s, v) => s + v.quantity, 0);

  const recipeRanking = recipes
    .map((r) => ({
      name: r.name,
      total: vitrine
        .filter((v) => v.recipeName === r.name)
        .reduce((s, v) => s + v.quantity, 0),
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div>
      <div
        style={{
          ...S.card,
          background: "#fff8f0",
          border: "1.5px solid #f4a261",
        }}
      >
        <div style={{ fontWeight: 700, color: "#b5530a", marginBottom: 14 }}>
          ➕ Mise en vitrine du jour
        </div>
        <div style={S.row}>
          <div style={{ flex: 2 }}>
            <label style={{ ...S.label, color: "#b5530a" }}>Recette</label>
            <select
              style={{ ...S.input, borderColor: "#f4a261" }}
              value={sel}
              onChange={(e) => setSel(e.target.value)}
            >
              <option value="">
                {"Bonjour" === "Bonjour" ? "— Choisir —" : "— Select —"}
              </option>
              {recipes.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ ...S.label, color: "#b5530a" }}>
              Nombre de pièces
            </label>
            <input
              style={{ ...S.input, borderColor: "#f4a261" }}
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>
          <div>
            <button
              style={{ ...btn(), background: "#f4a261" }}
              onClick={add}
              disabled={!sel}
            >
              🏪 Mettre en vitrine
            </button>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#b5530a", marginTop: 4 }}>
          ⚠️ La mise en vitrine déduit automatiquement les ingrédients du stock.
        </div>
      </div>

      <div style={S.card}>
        <div style={{ fontWeight: 700, color: DARK, marginBottom: 12 }}>
          📊 Gâteaux en vitrine — 7 derniers jours
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={last7}
            margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
          >
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="Gâteaux" fill="#F59E0B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        <div style={S.card}>
          <div style={{ fontWeight: 700, color: DARK, marginBottom: 12 }}>
            📅 Détail par jour
          </div>
          <label style={S.label}>Date</label>
          <input
            style={{ ...S.input, width: "auto" }}
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          {filtered.length === 0 ? (
            <p style={{ color: "#bbb", fontSize: 13 }}>
              Aucune mise en vitrine ce jour.
            </p>
          ) : (
            <>
              <div
                style={{
                  fontWeight: 700,
                  color: "#f4a261",
                  fontSize: 20,
                  margin: "8px 0",
                }}
              >
                {totalFiltré} gâteaux au total
              </div>
              {filtered.map((v, i) => {
                const globalIdx = vitrine.findIndex(
                  (x, gi) => x === v && !filtered.slice(0, i).includes(x)
                );
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: "1px solid #fce4ec",
                      fontSize: 14,
                    }}
                  >
                    <span>
                      🍰 <b>{v.recipeName}</b> — {v.quantity} pcs
                    </span>
                    <button
                      style={btn(false, true)}
                      onClick={() => del(vitrine.indexOf(v))}
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div style={S.card}>
          <div style={{ fontWeight: 700, color: DARK, marginBottom: 12 }}>
            🏆 Classement recettes (total)
          </div>
          {recipeRanking.length === 0 ? (
            <p style={{ color: "#bbb", fontSize: 13 }}>Aucune donnée.</p>
          ) : (
            recipeRanking.map((r, i) => {
              const max = recipeRanking[0].total || 1;
              return (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      marginBottom: 4,
                    }}
                  >
                    <span>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "  "}{" "}
                      {r.name}
                    </span>
                    <b>{r.total} pcs</b>
                  </div>
                  <div
                    style={{
                      background: "#F1F5F9",
                      borderRadius: 99,
                      height: 8,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        background: PINK,
                        height: "100%",
                        width: `${(r.total / max) * 100}%`,
                        borderRadius: 99,
                        transition: "width .4s",
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ── FOURNISSEURS PAGE ─────────────────────────────────────────────────────────
function FournisseursPage({
  fournisseurs,
  setFournisseurs,
  commandesFourn,
  setCommandesFourn,
  ingredients,
  setIngredients,
  ingredientNeeds,
  aCommander,
  recipes,
  setRecipes,
  prixHistorique,
  setPrixHistorique,
}) {
  const emptyF = {
    nom: "",
    contact: "",
    tel: "",
    email: "",
    delai: "24h",
    note: "",
  };
  const [formF, setFormF] = useState(emptyF);
  const [editFIdx, setEditFIdx] = useState(null);
  const [tab, setTab] = useState("fournisseurs");
  const [assocIng, setAssocIng] = useState("");
  const [assocFourn, setAssocFourn] = useState("");
  const [majPrixFourn, setMajPrixFourn] = useState(null); // fournisseur en cours de MAJ prix
  const [newPrices, setNewPrices] = useState({}); // { ingName: nouveauPrix }

  // Commande auto en cours de génération
  const [commandeEnCours, setCommandeEnCours] = useState(null);
  const [qteOverrides, setQteOverrides] = useState({});

  const ff = (k, v) => setFormF((prev) => ({ ...prev, [k]: v }));

  // Ouvrir le panneau de mise à jour des prix pour un fournisseur
  const ouvrirMajPrix = (fourn) => {
    const prices = {};
    fourn.ingredients?.forEach((i) => {
      const ing = ingredients.find((x) => x.name === i.name);
      if (ing) prices[i.name] = ing.pricePerKg;
    });
    setNewPrices(prices);
    setMajPrixFourn(fourn);
  };

  // Confirmer la mise à jour des prix en masse
  const confirmerMajPrix = () => {
    if (!majPrixFourn) return;
    const date = new Date().toLocaleDateString("fr-FR");
    const dateISO = new Date().toISOString().slice(0, 10);
    let changed = false;

    Object.entries(newPrices).forEach(([name, nvPrix]) => {
      const ing = ingredients.find((i) => i.name === name);
      if (!ing || +nvPrix === ing.pricePerKg) return;
      changed = true;

      // Historique
      setPrixHistorique((prev) => [
        ...prev,
        {
          date,
          dateISO,
          ingredientName: name,
          ancienPrix: ing.pricePerKg,
          nouveauPrix: +nvPrix,
          source: majPrixFourn.nom,
          variation: (
            ((+nvPrix - ing.pricePerKg) / ing.pricePerKg) *
            100
          ).toFixed(1),
        },
      ]);

      // Mise à jour ingrédient
      setIngredients((prev) =>
        prev.map((i) => (i.name === name ? { ...i, pricePerKg: +nvPrix } : i))
      );

      // Recalcul recettes impactées
      setRecipes((prev) =>
        prev.map((r) => {
          if (!r.ingredients?.find((x) => x.name === name)) return r;
          const ingCost = r.ingredients.reduce((s, x) => {
            const prix =
              x.name === name
                ? +nvPrix
                : ingredients.find((i) => i.name === x.name)?.pricePerKg || 0;
            return s + (prix / 1000) * x.quantity;
          }, 0);
          const lossMultiplier = 1 + (r.lossPct || 0) / 100;
          const laborCost = (r.laborHours || 0) * (r.hourlyRate || 0);
          const newCostPerUnit =
            (ingCost * lossMultiplier + laborCost) / (r.portions || 1);
          return {
            ...r,
            costPerUnit: newCostPerUnit,
            suggestedPrice: newCostPerUnit * (r.marginCoef || 1),
          };
        })
      );
    });

    setMajPrixFourn(null);
    setNewPrices({});
    if (changed) alert("✅ Prix mis à jour et recettes recalculées !");
  };

  // Sauvegarder fournisseur
  const saveFourn = () => {
    if (!formF.nom.trim()) return;
    if (editFIdx !== null) {
      setFournisseurs((prev) =>
        prev.map((f, i) => (i === editFIdx ? { ...formF } : f))
      );
      setEditFIdx(null);
    } else {
      setFournisseurs((prev) => [...prev, { ...formF, ingredients: [] }]);
    }
    setFormF(emptyF);
  };

  const delFourn = (idx) =>
    setFournisseurs((prev) => prev.filter((_, i) => i !== idx));
  const startEditF = (idx) => {
    setFormF(fournisseurs[idx]);
    setEditFIdx(idx);
  };

  // Associer ingrédient ↔ fournisseur
  const associer = () => {
    if (!assocIng || !assocFourn) return;
    setFournisseurs((prev) =>
      prev.map((f) => {
        if (f.nom !== assocFourn) return f;
        const already = f.ingredients?.find((i) => i.name === assocIng);
        if (already) return f;
        return {
          ...f,
          ingredients: [...(f.ingredients || []), { name: assocIng }],
        };
      })
    );
    setAssocIng("");
    setAssocFourn("");
  };

  const deassocier = (fournNom, ingName) => {
    setFournisseurs((prev) =>
      prev.map((f) =>
        f.nom === fournNom
          ? {
              ...f,
              ingredients: f.ingredients.filter((i) => i.name !== ingName),
            }
          : f
      )
    );
  };

  // Générer commande auto pour un fournisseur
  const genererCommande = (fourn) => {
    const lignes = aCommander
      .filter((ing) => fourn.ingredients?.find((i) => i.name === ing.name))
      .map((ing) => {
        const ingData = ingredients.find((i) => i.name === ing.name);
        // Arrondir au kg supérieur + 20% de marge de sécurité
        const qteMin = Math.ceil((ing.manque / 1000) * 1.2 * 10) / 10;
        return {
          name: ing.name,
          manque: ing.manque,
          qteKg: qteMin,
          prixKg: ingData?.pricePerKg || 0,
        };
      });
    if (lignes.length === 0) {
      alert(`Aucun ingrédient manquant associé à ${fourn.nom}`);
      return;
    }
    const overrides = {};
    lignes.forEach((l) => {
      overrides[l.name] = l.qteKg;
    });
    setQteOverrides(overrides);
    setCommandeEnCours({
      fournisseurNom: fourn.nom,
      fourn,
      lignes,
      date: new Date().toLocaleDateString("fr-FR"),
    });
    setTab("commande");
  };

  // Confirmer la commande → réapprovisionner le stock
  const confirmerCommande = () => {
    if (!commandeEnCours) return;
    const lignes = commandeEnCours.lignes.map((l) => ({
      ...l,
      qteKg: +qteOverrides[l.name] || l.qteKg,
    }));
    const total = lignes.reduce((s, l) => s + l.qteKg * l.prixKg, 0);

    // Réapprovisionner
    lignes.forEach((l) => {
      setIngredients((prev) =>
        prev.map((i) =>
          i.name === l.name
            ? { ...i, stock: i.stock + Math.round(l.qteKg * 1000) }
            : i
        )
      );
    });

    // Historique
    setCommandesFourn((prev) => [
      ...prev,
      {
        fournisseur: commandeEnCours.fournisseurNom,
        date: commandeEnCours.date,
        lignes,
        total,
        statut: "Envoyée",
      },
    ]);

    setCommandeEnCours(null);
    setQteOverrides({});
    setTab("historique");
  };

  const totalCommande = commandeEnCours
    ? commandeEnCours.lignes.reduce(
        (s, l) => s + (+qteOverrides[l.name] || l.qteKg) * l.prixKg,
        0
      )
    : 0;

  // Ingrédients déjà associés à un fournisseur
  const ingAssocies = fournisseurs.flatMap((f) =>
    (f.ingredients || []).map((i) => i.name)
  );

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { id: "fournisseurs", label: "🏭 Mes fournisseurs" },
          {
            id: "commande",
            label: "📋 Commande en cours" + (commandeEnCours ? " ●" : ""),
          },
          { id: "historique", label: "📜 Historique" },
        ].map((t) => (
          <button
            key={t.id}
            style={btn(tab === t.id)}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB FOURNISSEURS ── */}
      {tab === "fournisseurs" && (
        <div>
          {/* Alerte commande auto */}
          {aCommander.length > 0 && (
            <div
              style={{
                ...S.card,
                background: "#fff3e0",
                border: "1.5px solid #ffcc80",
                marginBottom: 16,
              }}
            >
              <div
                style={{ fontWeight: 700, color: "#e65100", marginBottom: 10 }}
              >
                🚨 {aCommander.length} ingrédient
                {aCommander.length > 1 ? "s" : ""} à commander — Générez une
                commande fournisseur
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {fournisseurs.map((f) => {
                  const nbManquants = aCommander.filter((ing) =>
                    f.ingredients?.find((i) => i.name === ing.name)
                  ).length;
                  if (nbManquants === 0) return null;
                  return (
                    <button
                      key={f.nom}
                      style={{ ...btn(), background: "#e65100" }}
                      onClick={() => genererCommande(f)}
                    >
                      📦 Commander chez {f.nom} ({nbManquants} article
                      {nbManquants > 1 ? "s" : ""})
                    </button>
                  );
                })}
                {fournisseurs.length === 0 && (
                  <span style={{ fontSize: 13, color: "#888" }}>
                    Ajoutez d'abord un fournisseur ci-dessous.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Formulaire fournisseur */}
          <div style={S.card}>
            <div style={{ fontWeight: 700, color: DARK, marginBottom: 14 }}>
              {editFIdx !== null
                ? "✏️ Modifier le fournisseur"
                : "➕ Nouveau fournisseur"}
            </div>
            <div style={S.row}>
              <div style={{ flex: 2 }}>
                <label style={S.label}>Nom du fournisseur</label>
                <input
                  style={S.input}
                  placeholder="ex: Maison Cacao"
                  value={formF.nom}
                  onChange={(e) => ff("nom", e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={S.label}>Délai livraison</label>
                <select
                  style={S.input}
                  value={formF.delai}
                  onChange={(e) => ff("delai", e.target.value)}
                >
                  <option value="24h">24h</option>
                  <option value="48h">48h</option>
                  <option value="72h">72h</option>
                  <option value="1 semaine">1 semaine</option>
                </select>
              </div>
            </div>
            <div style={S.row}>
              <div style={{ flex: 1 }}>
                <label style={S.label}>Contact</label>
                <input
                  style={S.input}
                  placeholder="Contact"
                  value={formF.contact}
                  onChange={(e) => ff("contact", e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={S.label}>Téléphone</label>
                <input
                  style={S.input}
                  placeholder="Téléphone"
                  value={formF.tel}
                  onChange={(e) => ff("tel", e.target.value)}
                />
              </div>
              <div style={{ flex: 2 }}>
                <label style={S.label}>Email</label>
                <input
                  style={S.input}
                  placeholder="Email"
                  value={formF.email}
                  onChange={(e) => ff("email", e.target.value)}
                />
              </div>
            </div>
            <label style={S.label}>Note</label>
            <input
              style={S.input}
              placeholder="Note"
              value={formF.note}
              onChange={(e) => ff("note", e.target.value)}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button style={btn()} onClick={saveFourn}>
                {editFIdx !== null ? "💾 Enregistrer" : "➕ Ajouter"}
              </button>
              {editFIdx !== null && (
                <button
                  style={btn(false)}
                  onClick={() => {
                    setEditFIdx(null);
                    setFormF(emptyF);
                  }}
                >
                  Annuler
                </button>
              )}
            </div>
          </div>

          {/* Association ingrédients → fournisseurs */}
          {fournisseurs.length > 0 && ingredients.length > 0 && (
            <div style={S.card}>
              <div style={{ fontWeight: 700, color: DARK, marginBottom: 14 }}>
                🔗 Associer un ingrédient à un fournisseur
              </div>
              <div style={S.row}>
                <div style={{ flex: 2 }}>
                  <label style={S.label}>Ingrédient</label>
                  <select
                    style={S.input}
                    value={assocIng}
                    onChange={(e) => setAssocIng(e.target.value)}
                  >
                    <option value="">
                      {"Bonjour" === "Bonjour" ? "— Choisir —" : "— Select —"}
                    </option>
                    {ingredients.map((i) => (
                      <option key={i.name} value={i.name}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 2 }}>
                  <label style={S.label}>Fournisseur</label>
                  <select
                    style={S.input}
                    value={assocFourn}
                    onChange={(e) => setAssocFourn(e.target.value)}
                  >
                    <option value="">
                      {"Bonjour" === "Bonjour" ? "— Choisir —" : "— Select —"}
                    </option>
                    {fournisseurs.map((f) => (
                      <option key={f.nom} value={f.nom}>
                        {f.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <button style={btn()} onClick={associer}>
                    🔗 Associer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Liste fournisseurs */}
          {fournisseurs.length === 0 ? (
            <div
              style={{
                ...S.card,
                textAlign: "center",
                color: "#bbb",
                padding: 40,
              }}
            >
              Aucun fournisseur ajouté.
            </div>
          ) : (
            fournisseurs.map((f, fi) => (
              <div key={fi} style={S.card}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 17, color: DARK }}>
                      {f.nom}
                    </div>
                    <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
                      {f.contact && `👤 ${f.contact}`}
                      {f.tel && ` · 📞 ${f.tel}`}
                      {f.email && ` · ✉️ ${f.email}`}
                    </div>
                    <div style={{ fontSize: 13, color: SLATE, marginTop: 2 }}>
                      ⏱️ Délai : {f.delai}
                      {f.note && ` · ${f.note}`}
                    </div>
                  </div>
                  <div style={S.row}>
                    {f.ingredients?.length > 0 && (
                      <button
                        style={{
                          ...btn(),
                          background: "#2a9d8f",
                          fontSize: 12,
                        }}
                        onClick={() => ouvrirMajPrix(f)}
                      >
                        💰 Mettre à jour les prix
                      </button>
                    )}
                    {aCommander.some((ing) =>
                      f.ingredients?.find((i) => i.name === ing.name)
                    ) && (
                      <button
                        style={{
                          ...btn(),
                          background: "#e65100",
                          fontSize: 12,
                        }}
                        onClick={() => genererCommande(f)}
                      >
                        📦 Générer commande
                      </button>
                    )}
                    <button style={btn(false)} onClick={() => startEditF(fi)}>
                      ✏️
                    </button>
                    <button
                      style={btn(false, true)}
                      onClick={() => delFourn(fi)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Ingrédients associés */}
                <div style={{ marginTop: 14 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: SLATE,
                      fontWeight: 700,
                      marginBottom: 8,
                    }}
                  >
                    🧂 Ingrédients fournis :
                  </div>
                  {!f.ingredients || f.ingredients.length === 0 ? (
                    <span style={{ fontSize: 13, color: "#bbb" }}>
                      Aucun ingrédient associé
                    </span>
                  ) : (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {f.ingredients.map((ing, ii) => {
                        const manque = aCommander.find(
                          (a) => a.name === ing.name
                        );
                        return (
                          <span
                            key={ii}
                            style={{
                              background: manque ? "#ffebee" : "#F1F5F9",
                              color: manque ? "#e53935" : DARK,
                              borderRadius: 8,
                              padding: "4px 12px",
                              fontSize: 13,
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            {manque ? "⚠️" : "✅"} {ing.name}
                            {manque && (
                              <span style={{ fontSize: 11 }}>
                                ({Math.round((manque.manque / 1000) * 10) / 10}{" "}
                                kg manquant)
                              </span>
                            )}
                            <span
                              style={{
                                cursor: "pointer",
                                color: "#bbb",
                                marginLeft: 4,
                              }}
                              onClick={() => deassocier(f.nom, ing.name)}
                            >
                              ×
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── MODAL MAJ PRIX FOURNISSEUR ── */}
      {majPrixFourn && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#0007",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 32,
              minWidth: 420,
              maxWidth: 560,
              width: "90%",
              boxShadow: "0 8px 40px #0003",
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: 18,
                color: DARK,
                marginBottom: 4,
              }}
            >
              💰 Mise à jour des prix — {majPrixFourn.nom}
            </div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>
              Renseigne les nouveaux prix de ta facture. Laisse inchangé si le
              prix est identique.
            </div>

            {majPrixFourn.ingredients?.map((ingRef, i) => {
              const ing = ingredients.find((x) => x.name === ingRef.name);
              if (!ing) return null;
              const nvPrix = +newPrices[ingRef.name];
              const diff =
                nvPrix && nvPrix !== ing.pricePerKg
                  ? nvPrix - ing.pricePerKg
                  : 0;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  <div style={{ flex: 2 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: DARK }}>
                      {ing.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#888" }}>
                      Actuel : {ing.pricePerKg.toFixed(2) + " €"}/kg
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      step="0.01"
                      value={newPrices[ingRef.name] || ""}
                      onChange={(e) =>
                        setNewPrices((prev) => ({
                          ...prev,
                          [ingRef.name]: e.target.value,
                        }))
                      }
                      style={{
                        ...S.input,
                        marginBottom: 0,
                        borderColor:
                          diff !== 0
                            ? diff > 0
                              ? "#ffcdd2"
                              : "#c8e6c9"
                            : "#E2E8F0",
                        fontWeight: 700,
                      }}
                      placeholder={`${ing.pricePerKg}`}
                    />
                  </div>
                  <div
                    style={{
                      minWidth: 80,
                      fontSize: 13,
                      fontWeight: 700,
                      color:
                        diff > 0 ? "#e53935" : diff < 0 ? "#2e7d32" : "#bbb",
                    }}
                  >
                    {diff > 0
                      ? `▲ +${diff.toFixed(2) + " €"}`
                      : diff < 0
                      ? `▼ ${diff.toFixed(2) + " €"}`
                      : "—"}
                  </div>
                </div>
              );
            })}

            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button style={btn()} onClick={confirmerMajPrix}>
                ✅ Confirmer et recalculer
              </button>
              <button
                style={btn(false)}
                onClick={() => {
                  setMajPrixFourn(null);
                  setNewPrices({});
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB COMMANDE EN COURS ── */}
      {tab === "commande" && (
        <div>
          {!commandeEnCours ? (
            <div
              style={{
                ...S.card,
                textAlign: "center",
                color: "#bbb",
                padding: 40,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
              <div>Aucune commande en attente.</div>
              <div style={{ fontSize: 13, marginTop: 8 }}>
                Générez une commande depuis l'onglet Fournisseurs.
              </div>
            </div>
          ) : (
            <div>
              <div style={S.card}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: DARK }}>
                      📦 Commande — {commandeEnCours.fournisseurNom}
                    </div>
                    <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
                      {commandeEnCours.fourn?.email &&
                        `✉️ ${commandeEnCours.fourn.email}`}
                      {commandeEnCours.fourn?.tel &&
                        ` · 📞 ${commandeEnCours.fourn.tel}`}
                      {commandeEnCours.fourn?.delai &&
                        ` · ⏱️ ${commandeEnCours.fourn.delai}`}
                    </div>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 22, color: PINK }}>
                    {totalCommande.toFixed(2) + " €"}
                  </div>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={S.tableHead}>
                      {[
                        "Ingrédient",
                        "Manque actuel",
                        "Qté à commander (kg)",
                        "Prix / kg",
                        "Total ligne",
                      ].map((h) => (
                        <th key={h} style={{ ...S.tableTd, textAlign: "left" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {commandeEnCours.lignes.map((l, i) => {
                      const qte = +qteOverrides[l.name] || l.qteKg;
                      return (
                        <tr key={i}>
                          <td style={{ ...S.tableTd, fontWeight: 700 }}>
                            🧂 {l.name}
                          </td>
                          <td style={{ ...S.tableTd, color: "#e53935" }}>
                            {l.manque >= 1000
                              ? `${(l.manque / 1000).toFixed(2)} kg`
                              : `${Math.round(l.manque)} g`}
                          </td>
                          <td style={S.tableTd}>
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={qteOverrides[l.name] || l.qteKg}
                              onChange={(e) =>
                                setQteOverrides((prev) => ({
                                  ...prev,
                                  [l.name]: e.target.value,
                                }))
                              }
                              style={{
                                width: 90,
                                padding: "6px 10px",
                                borderRadius: 8,
                                border: "1.5px solid #f8bbd0",
                                fontSize: 14,
                                fontWeight: 700,
                              }}
                            />
                          </td>
                          <td style={S.tableTd}>
                            {l.prixKg.toFixed(2) + " €"}
                          </td>
                          <td
                            style={{
                              ...S.tableTd,
                              fontWeight: 700,
                              color: PINK,
                            }}
                          >
                            {(qte * l.prixKg).toFixed(2) + " €"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div
                  style={{
                    marginTop: 16,
                    padding: "14px 18px",
                    background: "#F1F5F9",
                    borderRadius: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: 13, color: SLATE }}>
                    ✅ En confirmant, les quantités commandées seront ajoutées à
                    vos stocks automatiquement.
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 20, color: PINK }}>
                    {totalCommande.toFixed(2) + " €"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button style={btn()} onClick={confirmerCommande}>
                    ✅ Confirmer et réapprovisionner
                  </button>
                  <button
                    style={btn(false, true)}
                    onClick={() => {
                      setCommandeEnCours(null);
                      setQteOverrides({});
                    }}
                  >
                    🗑️ Annuler
                  </button>
                </div>
              </div>

              {/* Preview email */}
              <div style={S.card}>
                <div style={{ fontWeight: 700, color: DARK, marginBottom: 12 }}>
                  ✉️ Brouillon email fournisseur
                </div>
                <div
                  style={{
                    background: "#f9f9f9",
                    border: "1px solid #eee",
                    borderRadius: 10,
                    padding: 16,
                    fontFamily: "monospace",
                    fontSize: 13,
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    color: "#333",
                  }}
                >
                  {`À : ${commandeEnCours.fourn?.email || "[email fournisseur]"}
Objet : Commande ingrédients — ${commandeEnCours.date}

Bonjour ${commandeEnCours.fourn?.contact || ""},

Je vous contacte pour passer commande des articles suivants :

${commandeEnCours.lignes
  .map((l) => {
    const qte = +qteOverrides[l.name] || l.qteKg;
    return `  • ${l.name} : ${qte} kg`;
  })
  .join("\n")}

Total estimé : ${totalCommande.toFixed(2) + " €"}

Merci de confirmer la disponibilité et le délai de livraison.

Cordialement`}
                </div>
                <button
                  style={{ ...btn(false), marginTop: 12, fontSize: 12 }}
                  onClick={() =>
                    navigator.clipboard?.writeText(
                      `À : ${
                        commandeEnCours.fourn?.email || ""
                      }\nObjet : Commande ingrédients — ${
                        commandeEnCours.date
                      }\n\nBonjour ${
                        commandeEnCours.fourn?.contact || ""
                      },\n\nJe vous contacte pour passer commande :\n\n${commandeEnCours.lignes
                        .map(
                          (l) =>
                            `  • ${l.name} : ${
                              +qteOverrides[l.name] || l.qteKg
                            } kg`
                        )
                        .join("\n")}\n\nTotal : ${
                        totalCommande.toFixed(2) + " €"
                      }\n\nCordialement`
                    )
                  }
                >
                  📋 Copier l'email
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB HISTORIQUE ── */}
      {tab === "historique" && (
        <div style={S.card}>
          <div style={{ fontWeight: 700, color: DARK, marginBottom: 14 }}>
            📜 Historique des commandes fournisseurs
          </div>
          {commandesFourn.length === 0 ? (
            <p style={{ color: "#bbb" }}>Aucune commande passée.</p>
          ) : (
            [...commandesFourn].reverse().map((c, i) => (
              <div
                key={i}
                style={{
                  borderBottom: "1px solid #fce4ec",
                  paddingBottom: 16,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: DARK }}>
                      🏭 {c.fournisseur}
                    </div>
                    <div style={{ fontSize: 12, color: "#888" }}>{c.date}</div>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <span
                      style={{ fontWeight: 800, color: PINK, fontSize: 16 }}
                    >
                      {(c.total || 0).toFixed(2) + " €"}
                    </span>
                    <span
                      style={{
                        background: "#e8f5e9",
                        color: "#2e7d32",
                        borderRadius: 8,
                        padding: "3px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {c.statut}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 10,
                  }}
                >
                  {c.lignes.map((l, j) => (
                    <span
                      key={j}
                      style={{
                        background: "#F1F5F9",
                        color: DARK,
                        borderRadius: 8,
                        padding: "4px 12px",
                        fontSize: 13,
                      }}
                    >
                      {l.name} : {l.qteKg} kg
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── SEUIL DE RENTABILITÉ ──────────────────────────────────────────────────────
function SeuilRentabilite({ charges, recipes, orders, pertes }) {
  // Charges fixes totales mensuelles
  const chargesMensuel = charges.reduce((s, c) => {
    if (c.period === "Monthly" || c.period === "Mensuel") return s + c.amount;
    if (c.period === "Annual" || c.period === "Annuel")
      return s + c.amount / 12;
    if (c.period === "Weekly" || c.period === "Hebdo")
      return s + c.amount * 4.33;
    return s;
  }, 0);

  // Paramètres ajustables
  const [salaireObjectif, setSalaireObjectif] = useState(2000);
  const [nbJoursTravail, setNbJoursTravail] = useState(22);
  const [recetteRef, setRecetteRef] = useState(recipes[0]?.name || "");

  const recette = recipes.find((r) => r.name === recetteRef);

  // Coûts variables moyens (depuis les recettes)
  const margeMoyenne =
    recipes.length > 0
      ? recipes.reduce(
          (s, r) => s + ((r.suggestedPrice || 0) - (r.costPerUnit || 0)),
          0
        ) / recipes.length
      : 0;
  const prixMoyen =
    recipes.length > 0
      ? recipes.reduce((s, r) => s + (r.suggestedPrice || 0), 0) /
        recipes.length
      : 0;
  const tauxMargeVariable = prixMoyen > 0 ? margeMoyenne / prixMoyen : 0;

  // Charges totales à couvrir
  const totalACouvrir = chargesMensuel + salaireObjectif;

  // Seuil de rentabilité en €
  const seuilEuros =
    tauxMargeVariable > 0 ? totalACouvrir / tauxMargeVariable : 0;

  // Seuil en nombre de pièces (recette de référence)
  const seuilPieces =
    recette && recette.suggestedPrice > 0
      ? Math.ceil(
          totalACouvrir / (recette.suggestedPrice - recette.costPerUnit)
        )
      : 0;
  const seuilParJour =
    nbJoursTravail > 0 ? Math.ceil(seuilPieces / nbJoursTravail) : 0;

  // CA réel du mois (orders)
  const now = new Date();
  const moisCourant = `${now.getMonth() + 1}/${now.getFullYear()}`;
  const caReel = orders.reduce((s, o) => s + (o.price || 0), 0);
  const pctAtteint =
    seuilEuros > 0 ? Math.min(100, (caReel / seuilEuros) * 100) : 0;
  const resteAFaire = Math.max(0, seuilEuros - caReel);

  // Pertes du mois
  const pertesTotales = pertes.reduce((s, p) => s + (p.cost || 0), 0);

  // Données graphique point mort
  const graphData = Array.from({ length: 11 }, (_, i) => {
    const pct = i * 10;
    const pieces = Math.round((seuilPieces * pct) / 100);
    const ca = recette ? pieces * (recette.suggestedPrice || 0) : 0;
    const couts = recette
      ? pieces * (recette.costPerUnit || 0) + totalACouvrir
      : totalACouvrir;
    return { pct: `${pct}%`, CA: Math.round(ca), Coûts: Math.round(couts) };
  });

  const statusColor =
    pctAtteint >= 100 ? "#2e7d32" : pctAtteint >= 60 ? "#f57f17" : "#e53935";
  const statusLabel =
    pctAtteint >= 100
      ? "✅ Seuil atteint !"
      : pctAtteint >= 60
      ? "⚠️ En bonne voie"
      : "🔴 En dessous du seuil";

  return (
    <div>
      {/* Header */}
      <div
        style={{
          ...S.card,
          background: "linear-gradient(135deg, #fff5f7, #fff8f0)",
          border: "1.5px solid #f8bbd0",
        }}
      >
        <div
          style={{
            fontWeight: 900,
            fontSize: 20,
            color: DARK,
            marginBottom: 4,
          }}
        >
          📊 Seuil de rentabilité
        </div>
        <div style={{ fontSize: 13, color: "#888" }}>
          Combien dois-je vendre pour couvrir toutes mes charges et me payer ?
        </div>
      </div>

      {/* Paramètres */}
      <div style={S.card}>
        <div style={{ fontWeight: 700, color: DARK, marginBottom: 14 }}>
          ⚙️ Paramètres
        </div>
        <div style={S.row}>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Salaire objectif (€/mois)</label>
            <input
              style={S.input}
              type="number"
              value={salaireObjectif}
              onChange={(e) => setSalaireObjectif(+e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Jours travaillés / mois</label>
            <input
              style={S.input}
              type="number"
              value={nbJoursTravail}
              onChange={(e) => setNbJoursTravail(+e.target.value)}
            />
          </div>
          <div style={{ flex: 2 }}>
            <label style={S.label}>Recette de référence pour le calcul</label>
            <select
              style={S.input}
              value={recetteRef}
              onChange={(e) => setRecetteRef(e.target.value)}
            >
              <option value="">
                {"Bonjour" === "Bonjour"
                  ? "— Choisir une recette —"
                  : "— Select recipe —"}
              </option>
              {recipes.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name} ({(r.suggestedPrice || 0).toFixed(2) + " €"} / pièce)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPIs seuil */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))",
          gap: 14,
          marginBottom: 16,
        }}
      >
        <KPI
          title="💳 Charges fixes / mois"
          value={`${chargesMensuel.toFixed(0)} €`}
          accent={ACCENT}
        />
        <KPI
          title="👤 Salaire objectif"
          value={`${salaireObjectif.toFixed(0)} €`}
          accent={NAVY}
        />
        <KPI
          title="🎯 Total à couvrir"
          value={`${totalACouvrir.toFixed(0)} €`}
          accent={DARK}
        />
        <KPI
          title="💶 Seuil en CA"
          value={`${seuilEuros.toFixed(0)} €€`}
          accent={PINK}
        />
        {recette && (
          <KPI
            title="🍰 Pièces à vendre/mois"
            value={`${seuilPieces} pcs`}
            accent={SUCCESS}
          />
        )}
        {recette && (
          <KPI
            title="📅 Pièces à vendre/jour"
            value={`${seuilParJour} pcs`}
            accent={WARNING}
          />
        )}
      </div>

      {/* Progression vers le seuil */}
      <div style={{ ...S.card, border: `1.5px solid ${statusColor}33` }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 700, color: DARK }}>
            📈 Progression vers le seuil
          </div>
          <span style={{ fontWeight: 700, color: statusColor, fontSize: 15 }}>
            {statusLabel}
          </span>
        </div>
        <div
          style={{
            background: "#F1F5F9",
            borderRadius: 99,
            height: 14,
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              background: statusColor,
              height: "100%",
              borderRadius: 99,
              width: `${pctAtteint}%`,
              transition: "width .6s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: 8,
            }}
          >
            {pctAtteint > 15 && (
              <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>
                {Math.round(pctAtteint)}%
              </span>
            )}
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#888" }}>CA réalisé</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: PINK }}>
              {caReel.toFixed(0)} €
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#888" }}>Seuil à atteindre</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: DARK }}>
              {seuilEuros.toFixed(0)} €
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#888" }}>Reste à faire</div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: resteAFaire > 0 ? "#e53935" : "#2e7d32",
              }}
            >
              {resteAFaire > 0
                ? `${resteAFaire.toFixed(0)} €€`
                : "Objectif atteint 🎉"}
            </div>
          </div>
        </div>
      </div>

      {/* Graphique point mort */}
      {recette && (
        <div style={S.card}>
          <div style={{ fontWeight: 700, color: DARK, marginBottom: 4 }}>
            📉 Graphique du point mort — {recette.name}
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>
            Le point où CA et Coûts se croisent = votre seuil de rentabilité
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={graphData}
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="pct" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v} €`} />
              <Legend />
              <Bar dataKey="CA" fill={ACCENT} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Coûts" fill={ACCENT} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Analyse détaillée */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        <div style={S.card}>
          <div style={{ fontWeight: 700, color: DARK, marginBottom: 14 }}>
            💡 Analyse recette par recette
          </div>
          {recipes.length === 0 ? (
            <p style={{ color: "#bbb" }}>Aucune recette créée.</p>
          ) : (
            recipes.map((r, i) => {
              const margeUnit = (r.suggestedPrice || 0) - (r.costPerUnit || 0);
              const nbPourCouvrir =
                margeUnit > 0 ? Math.ceil(totalACouvrir / margeUnit) : "∞";
              const nbParJour =
                typeof nbPourCouvrir === "number"
                  ? Math.ceil(nbPourCouvrir / nbJoursTravail)
                  : "∞";
              const pctMarge =
                r.suggestedPrice > 0 ? (margeUnit / r.suggestedPrice) * 100 : 0;
              return (
                <div
                  key={i}
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid #fce4ec",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{ fontWeight: 700, fontSize: 14, color: DARK }}
                    >
                      🍰 {r.name}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        background: pctMarge >= 50 ? "#e8f5e9" : "#fff8e1",
                        color: pctMarge >= 50 ? "#2e7d32" : "#f57f17",
                        borderRadius: 8,
                        padding: "2px 10px",
                        fontWeight: 700,
                      }}
                    >
                      {pctMarge.toFixed(0)}% marge
                    </span>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 8,
                      fontSize: 12,
                    }}
                  >
                    <div>
                      <span style={{ color: "#888" }}>Marge / pièce</span>
                      <br />
                      <b style={{ color: "#2e7d32" }}>
                        {margeUnit.toFixed(2) + " €"}
                      </b>
                    </div>
                    <div>
                      <span style={{ color: "#888" }}>Pièces / mois</span>
                      <br />
                      <b style={{ color: DARK }}>{nbPourCouvrir}</b>
                    </div>
                    <div>
                      <span style={{ color: "#888" }}>Pièces / jour</span>
                      <br />
                      <b style={{ color: PINK }}>{nbParJour}</b>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={S.card}>
          <div style={{ fontWeight: 700, color: DARK, marginBottom: 14 }}>
            ⚠️ Impact des pertes
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>
              Pertes enregistrées
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#e53935" }}>
              {pertesTotales.toFixed(2) + " €"}
            </div>
          </div>
          {pertesTotales > 0 && (
            <>
              <div
                style={{
                  background: "#fff3f3",
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{ fontSize: 13, color: "#c62828", fontWeight: 600 }}
                >
                  Pour compenser ces pertes, il faut vendre en plus :
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#e53935",
                    marginTop: 6,
                  }}
                >
                  {tauxMargeVariable > 0
                    ? `${(pertesTotales / tauxMargeVariable).toFixed(0)} `
                    : "—"}{" "}
                  de CA supplémentaire
                </div>
              </div>
              {recette && (
                <div style={{ fontSize: 13, color: "#888" }}>
                  Soit environ{" "}
                  <b style={{ color: DARK }}>
                    {recette.suggestedPrice > recette.costPerUnit
                      ? Math.ceil(
                          pertesTotales /
                            (recette.suggestedPrice - recette.costPerUnit)
                        )
                      : "∞"}{" "}
                    pièces
                  </b>{" "}
                  supplémentaires de {recette.name}
                </div>
              )}
            </>
          )}
          {pertesTotales === 0 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 28 }}>🟢</div>
              <div
                style={{
                  fontSize: 13,
                  color: "#2e7d32",
                  fontWeight: 600,
                  marginTop: 8,
                }}
              >
                Aucune perte enregistrée
              </div>
            </div>
          )}

          {/* Conseil */}
          <div
            style={{
              marginTop: 16,
              background: "#f3e5f5",
              borderRadius: 10,
              padding: 14,
            }}
          >
            <div style={{ fontWeight: 700, color: "#7b1fa2", marginBottom: 6 }}>
              💡 Conseil
            </div>
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>
              {tauxMargeVariable < 0.4
                ? "Votre taux de marge est faible (< 40%). Revoyez vos prix de vente ou réduisez vos coûts d'ingrédients."
                : tauxMargeVariable < 0.6
                ? "Votre taux de marge est correct. Augmenter légèrement vos prix ou réduire les pertes améliorerait la rentabilité."
                : "Excellent taux de marge (> 60%) ! Concentrez-vous sur l'augmentation du volume de ventes."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── HISTORIQUE DES PRIX ───────────────────────────────────────────────────────
function PrixHistoriquePage({
  ingredients,
  setIngredients,
  prixHistorique,
  setPrixHistorique,
  recipes,
  setRecipes,
  fournisseurs,
}) {
  const [selectedIng, setSelectedIng] = useState("");
  const [nouveauPrix, setNouveauPrix] = useState("");
  const [source, setSource] = useState("");
  const [recalcRecipes, setRecalcRecipes] = useState(true);

  const ing = ingredients.find((i) => i.name === selectedIng);

  // Fournisseur associé à l'ingrédient sélectionné
  const fournisseurAssocie = fournisseurs?.find((f) =>
    f.ingredients?.find((i) => i.name === selectedIng)
  );

  // Auto-remplir la source avec le fournisseur dès la sélection
  const handleSelectIng = (name) => {
    setSelectedIng(name);
    setNouveauPrix("");
    const fourn = fournisseurs?.find((f) =>
      f.ingredients?.find((i) => i.name === name)
    );
    setSource(fourn ? fourn.nom : "");
  };

  const mettreAJourPrix = () => {
    if (!ing || !nouveauPrix) return;
    const ancienPrix = ing.pricePerKg;
    const nvPrix = +nouveauPrix;
    if (nvPrix === ancienPrix) return;

    // Enregistrer dans l'historique
    setPrixHistorique((prev) => [
      ...prev,
      {
        date: new Date().toLocaleDateString("fr-FR"),
        dateISO: new Date().toISOString().slice(0, 10),
        ingredientName: ing.name,
        ancienPrix,
        nouveauPrix: nvPrix,
        source: source.trim() || "Manuel",
        variation: (((nvPrix - ancienPrix) / ancienPrix) * 100).toFixed(1),
      },
    ]);

    // Mettre à jour le prix de l'ingrédient
    setIngredients((prev) =>
      prev.map((i) => (i.name === ing.name ? { ...i, pricePerKg: nvPrix } : i))
    );

    // Recalculer les recettes impactées
    if (recalcRecipes) {
      setRecipes((prev) =>
        prev.map((r) => {
          const ingInRecipe = r.ingredients?.find((x) => x.name === ing.name);
          if (!ingInRecipe) return r;
          // Recalcul du coût
          const ingCost = r.ingredients.reduce((s, x) => {
            const found =
              x.name === ing.name
                ? { pricePerKg: nvPrix }
                : ingredients.find((i) => i.name === x.name);
            return s + (found ? (found.pricePerKg / 1000) * x.quantity : 0);
          }, 0);
          const lossMultiplier = 1 + (r.lossPct || 0) / 100;
          const laborCost = (r.laborHours || 0) * (r.hourlyRate || 0);
          const newCostPerUnit =
            (ingCost * lossMultiplier + laborCost) / (r.portions || 1);
          const newSuggestedPrice = newCostPerUnit * (r.marginCoef || 1);
          return {
            ...r,
            costPerUnit: newCostPerUnit,
            suggestedPrice: newSuggestedPrice,
          };
        })
      );
    }

    setSelectedIng("");
    setNouveauPrix("");
    setSource("");
  };

  // Recettes impactées par l'ingrédient sélectionné
  const recipesImpactees = ing
    ? recipes.filter((r) => r.ingredients?.find((x) => x.name === ing.name))
    : [];

  // Impact estimé si le prix change
  const impactEstime =
    ing && nouveauPrix && +nouveauPrix !== ing.pricePerKg
      ? recipesImpactees.map((r) => {
          const ingInRecipe = r.ingredients.find((x) => x.name === ing.name);
          const diffPrixKg = +nouveauPrix - ing.pricePerKg;
          const diffCoutRecette =
            (diffPrixKg / 1000) *
            ingInRecipe.quantity *
            (1 + (r.lossPct || 0) / 100);
          const diffCoutUnit = diffCoutRecette / (r.portions || 1);
          const newCost = (r.costPerUnit || 0) + diffCoutUnit;
          const newPrice = newCost * (r.marginCoef || 1);
          return {
            name: r.name,
            ancienPrix: r.suggestedPrice,
            nouveauPrix: newPrice,
            diff: newPrice - r.suggestedPrice,
          };
        })
      : [];

  // Stats par ingrédient
  const statsParIng = ingredients.map((ing) => {
    const historique = prixHistorique.filter(
      (h) => h.ingredientName === ing.name
    );
    const lastChange = historique[historique.length - 1];
    const variation30j = historique.filter((h) => {
      const d = new Date(h.dateISO);
      const now = new Date();
      return (now - d) / (1000 * 60 * 60 * 24) <= 30;
    });
    const tendance =
      variation30j.length > 0
        ? variation30j.reduce((s, h) => s + +h.variation, 0)
        : 0;
    return {
      ...ing,
      historique,
      lastChange,
      tendance,
      nbChangements: historique.length,
    };
  });

  return (
    <div>
      {/* Mise à jour du prix */}
      <div style={S.card}>
        <div style={{ fontWeight: 700, color: DARK, marginBottom: 14 }}>
          🔄 Mettre à jour un prix d'ingrédient
        </div>
        <div style={S.row}>
          <div style={{ flex: 2 }}>
            <label style={S.label}>Ingrédient</label>
            <select
              style={S.input}
              value={selectedIng}
              onChange={(e) => handleSelectIng(e.target.value)}
            >
              <option value="">
                {"Bonjour" === "Bonjour" ? "— Choisir —" : "— Select —"}
              </option>
              {ingredients.map((i) => {
                const fourn = fournisseurs?.find((f) =>
                  f.ingredients?.find((x) => x.name === i.name)
                );
                return (
                  <option key={i.name} value={i.name}>
                    {i.name} (actuel : {i.pricePerKg} €/kg
                    {fourn ? ` · ${fourn.nom}` : ""})
                  </option>
                );
              })}
            </select>
            {fournisseurAssocie && (
              <div
                style={{
                  marginTop: -4,
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    background: "#F1F5F9",
                    color: DARK,
                    borderRadius: 8,
                    padding: "3px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  🏭 Fournisseur : {fournisseurAssocie.nom}
                </span>
                {fournisseurAssocie.tel && (
                  <span style={{ fontSize: 12, color: "#888" }}>
                    📞 {fournisseurAssocie.tel}
                  </span>
                )}
                {fournisseurAssocie.email && (
                  <span style={{ fontSize: 12, color: "#888" }}>
                    ✉️ {fournisseurAssocie.email}
                  </span>
                )}
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Nouveau prix (€/kg)</label>
            <input
              style={S.input}
              type="number"
              step="0.01"
              placeholder="0.00"
              value={nouveauPrix}
              onChange={(e) => setNouveauPrix(e.target.value)}
            />
          </div>
          <div style={{ flex: 2 }}>
            <label style={S.label}>Source</label>
            <input
              style={S.input}
              placeholder="Source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>
        </div>

        {/* Option recalcul recettes */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
            cursor: "pointer",
          }}
          onClick={() => setRecalcRecipes((v) => !v)}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              border: `2px solid ${PINK}`,
              background: recalcRecipes ? PINK : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {recalcRecipes && (
              <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>
                ✓
              </span>
            )}
          </div>
          <span style={{ fontSize: 13, color: DARK }}>
            Recalculer automatiquement le coût et le prix conseillé des recettes
            impactées
          </span>
        </div>

        {/* Prévisualisation impact */}
        {impactEstime.length > 0 && (
          <div
            style={{
              background: "#fff8e1",
              border: "1.5px solid #ffe082",
              borderRadius: 12,
              padding: 14,
              marginBottom: 14,
            }}
          >
            <div
              style={{ fontWeight: 700, color: "#e65100", marginBottom: 10 }}
            >
              ⚡ Impact sur {impactEstime.length} recette
              {impactEstime.length > 1 ? "s" : ""} :
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: "#fff3e0",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {["Recette", "Prix actuel", "Nouveau prix", "Variation"].map(
                    (h) => (
                      <th key={h} style={{ ...S.tableTd, textAlign: "left" }}>
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {impactEstime.map((r, i) => (
                  <tr key={i}>
                    <td style={S.tableTd}>
                      <b>{r.name}</b>
                    </td>
                    <td style={S.tableTd}>
                      {(r.ancienPrix || 0).toFixed(2) + " €"}
                    </td>
                    <td style={{ ...S.tableTd, fontWeight: 700 }}>
                      {r.nouveauPrix.toFixed(2) + " €"}
                    </td>
                    <td
                      style={{
                        ...S.tableTd,
                        fontWeight: 700,
                        color: r.diff > 0 ? "#e53935" : "#2e7d32",
                      }}
                    >
                      {r.diff > 0 ? "+" : ""}
                      {r.diff.toFixed(2) + " €"} ({r.diff > 0 ? "+" : ""}
                      {((r.diff / r.ancienPrix) * 100).toFixed(1)}%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          style={btn()}
          onClick={mettreAJourPrix}
          disabled={!selectedIng || !nouveauPrix}
        >
          💾 Mettre à jour le prix
        </button>
      </div>

      {/* Tableau de bord des prix */}
      <div style={S.card}>
        <div style={{ fontWeight: 700, color: DARK, marginBottom: 14 }}>
          📊 Évolution des prix — Vue d'ensemble
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={S.tableHead}>
              {[
                "Ingrédient",
                "Fournisseur",
                "Prix actuel",
                "Dernier changement",
                "Tendance 30j",
                "Nb modifications",
                "",
              ].map((h) => (
                <th key={h} style={{ ...S.tableTd, textAlign: "left" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {statsParIng.map((ing, i) => {
              const fourn = fournisseurs?.find((f) =>
                f.ingredients?.find((x) => x.name === ing.name)
              );
              return (
                <tr key={i}>
                  <td style={{ ...S.tableTd, fontWeight: 700 }}>{ing.name}</td>
                  <td style={S.tableTd}>
                    {fourn ? (
                      <span
                        style={{
                          background: "#F1F5F9",
                          color: DARK,
                          borderRadius: 8,
                          padding: "3px 10px",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        🏭 {fourn.nom}
                      </span>
                    ) : (
                      <span style={{ color: "#bbb", fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td style={S.tableTd}>
                    <b>{ing.pricePerKg.toFixed(2) + " €"}/kg</b>
                  </td>
                  <td style={{ ...S.tableTd, fontSize: 12, color: "#888" }}>
                    {ing.lastChange
                      ? `${ing.lastChange.date} · ${
                          +ing.lastChange.variation > 0 ? "+" : ""
                        }${ing.lastChange.variation}%`
                      : "Jamais modifié"}
                  </td>
                  <td style={S.tableTd}>
                    {ing.tendance === 0 ? (
                      <span style={{ color: "#888" }}>—</span>
                    ) : (
                      <span
                        style={{
                          fontWeight: 700,
                          color: ing.tendance > 0 ? "#e53935" : "#2e7d32",
                        }}
                      >
                        {ing.tendance > 0 ? "▲" : "▼"}{" "}
                        {Math.abs(+ing.tendance).toFixed(1)}%
                      </span>
                    )}
                  </td>
                  <td style={S.tableTd}>{ing.nbChangements}</td>
                  <td style={S.tableTd}>
                    <button
                      style={btn(false)}
                      onClick={() => {
                        handleSelectIng(ing.name);
                        window.scrollTo(0, 0);
                      }}
                    >
                      ✏️ Modifier
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Historique complet */}
      {prixHistorique.length > 0 && (
        <div style={S.card}>
          <div style={{ fontWeight: 700, color: DARK, marginBottom: 14 }}>
            📜 Historique complet des modifications
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={S.tableHead}>
                {[
                  "Date",
                  "Ingrédient",
                  "Fournisseur",
                  "Ancien prix",
                  "Nouveau prix",
                  "Variation",
                  "Source",
                ].map((h) => (
                  <th key={h} style={{ ...S.tableTd, textAlign: "left" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...prixHistorique].reverse().map((h, i) => {
                const fourn = fournisseurs?.find((f) =>
                  f.ingredients?.find((x) => x.name === h.ingredientName)
                );
                return (
                  <tr key={i}>
                    <td style={{ ...S.tableTd, fontSize: 12, color: "#888" }}>
                      {h.date}
                    </td>
                    <td style={{ ...S.tableTd, fontWeight: 700 }}>
                      {h.ingredientName}
                    </td>
                    <td style={S.tableTd}>
                      {fourn ? (
                        <span
                          style={{
                            background: "#F1F5F9",
                            color: DARK,
                            borderRadius: 8,
                            padding: "2px 8px",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {fourn.nom}
                        </span>
                      ) : (
                        <span style={{ color: "#bbb", fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td style={S.tableTd}>{h.ancienPrix} €/kg</td>
                    <td style={{ ...S.tableTd, fontWeight: 700 }}>
                      {h.nouveauPrix} €/kg
                    </td>
                    <td
                      style={{
                        ...S.tableTd,
                        fontWeight: 700,
                        color: +h.variation > 0 ? "#e53935" : "#2e7d32",
                      }}
                    >
                      {+h.variation > 0 ? "+" : ""}
                      {h.variation}%
                    </td>
                    <td style={{ ...S.tableTd, fontSize: 12, color: "#888" }}>
                      {h.source}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── EXPORT PAGE ───────────────────────────────────────────────────────────────
function ExportPage({
  orders,
  recipes,
  ingredients,
  charges,
  pertes,
  planning,
  vitrine,
  fournisseurs,
  commandesFourn,
  prixHistorique,
}) {
  // ── CSV export helper ──
  const downloadCSV = (filename, headers, rows) => {
    const bom = "\uFEFF"; // UTF-8 BOM pour Excel
    const lines = [
      headers.join(";"),
      ...rows.map((r) =>
        r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";")
      ),
    ];
    const blob = new Blob([bom + lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Print / PDF helper ──
  const printSection = (html, title) => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #222; font-size: 13px; }
        h1 { color: #e8547a; font-size: 20px; margin-bottom: 4px; }
        h2 { color: #880e4f; font-size: 15px; margin: 20px 0 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th { background: #fce4ec; padding: 8px 10px; text-align: left; font-size: 12px; }
        td { padding: 7px 10px; border-bottom: 1px solid #fce4ec; font-size: 12px; }
        .kpi { display: inline-block; background: #fff5f7; border-left: 3px solid #e8547a; padding: 8px 16px; margin: 6px 8px 6px 0; border-radius: 6px; }
        .kpi-label { font-size: 11px; color: #ad1457; } .kpi-value { font-size: 18px; font-weight: bold; color: #880e4f; }
        @media print { button { display: none; } }
      </style></head><body>
      <h1>🍞 Knead — ${title}</h1>
      <p style="color:#888;font-size:11px;">Exporté le ${new Date().toLocaleDateString(
        "fr-FR"
      )} à ${new Date().toLocaleTimeString("fr-FR")}</p>
      ${html}
      <script>window.onload=()=>window.print();<\/script>
      </body></html>
    `);
    win.document.close();
  };

  // ── Exports CSV ──

  const exportCommandesCSV = () => {
    downloadCSV(
      `commandes_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Date",
        "Recette",
        "Client",
        "Quantité",
        "Prix (€)",
        "Coût (€)",
        "Marge (€)",
        "Statut",
        "Note",
      ],
      orders.map((o) => [
        o.date,
        o.recipeName,
        o.client,
        o.quantity,
        (o.price || 0).toFixed(2),
        (o.cost || 0).toFixed(2),
        ((o.price || 0) - (o.cost || 0)).toFixed(2),
        o.status,
        o.note,
      ])
    );
  };

  const exportRecettesCSV = () => {
    downloadCSV(
      `recettes_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Recette",
        "Portions",
        "Coût/pièce (€)",
        "Prix conseillé (€)",
        "Marge x",
        "Ingrédients",
      ],
      recipes.map((r) => [
        r.name,
        r.portions,
        (r.costPerUnit || 0).toFixed(2),
        (r.suggestedPrice || 0).toFixed(2),
        r.marginCoef,
        r.ingredients?.map((i) => `${i.name}:${i.quantity}g`).join(" | "),
      ])
    );
  };

  const exportStocksCSV = () => {
    downloadCSV(
      `stocks_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Ingrédient",
        "Prix/kg (€)",
        "Stock (g)",
        "Stock (kg)",
        "Valeur stock (€)",
        "Alerte",
      ],
      ingredients.map((i) => [
        i.name,
        i.pricePerKg,
        i.stock,
        (i.stock / 1000).toFixed(3),
        ((i.pricePerKg / 1000) * i.stock).toFixed(2),
        i.stock <= 2000 ? "FAIBLE" : "OK",
      ])
    );
  };

  const exportPertesCSV = () => {
    downloadCSV(
      `pertes_${new Date().toISOString().slice(0, 10)}.csv`,
      ["Date", "Type", "Nom", "Quantité", "Coût (€)", "Raison"],
      pertes.map((p) => [
        p.date,
        p.type,
        p.name,
        p.quantity,
        (p.cost || 0).toFixed(2),
        p.reason,
      ])
    );
  };

  const exportChargesCSV = () => {
    downloadCSV(
      `charges_${new Date().toISOString().slice(0, 10)}.csv`,
      ["Charge", "Montant (€)", "Fréquence", "Équiv. mensuel (€)"],
      charges.map((c) => {
        const equiv =
          c.period === "Annual" || c.period === "Annuel"
            ? c.amount / 12
            : c.period === "Weekly" || c.period === "Hebdo"
            ? c.amount * 4.33
            : c.amount;
        return [c.name, c.amount, c.period, equiv.toFixed(2)];
      })
    );
  };

  const exportPrixHistoriqueCSV = () => {
    downloadCSV(
      `prix_historique_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Date",
        "Ingrédient",
        "Ancien prix (€/kg)",
        "Nouveau prix (€/kg)",
        "Variation (%)",
        "Source",
      ],
      prixHistorique.map((h) => [
        h.date,
        h.ingredientName,
        h.ancienPrix,
        h.nouveauPrix,
        h.variation,
        h.source,
      ])
    );
  };

  const exportCommandesFournCSV = () => {
    const rows = [];
    commandesFourn.forEach((c) => {
      c.lignes.forEach((l) => {
        rows.push([
          c.date,
          c.fournisseur,
          l.name,
          l.qteKg,
          l.prixKg,
          (l.qteKg * l.prixKg).toFixed(2),
          c.statut,
        ]);
      });
    });
    downloadCSV(
      `commandes_fournisseurs_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Date",
        "Fournisseur",
        "Ingrédient",
        "Qté (kg)",
        "Prix/kg (€)",
        "Total ligne (€)",
        "Statut",
      ],
      rows
    );
  };

  // ── Exports PDF ──

  const exportBilanPDF = () => {
    const totalCA = orders.reduce((s, o) => s + (o.price || 0), 0);
    const totalCout = orders.reduce((s, o) => s + (o.cost || 0), 0);
    const totalMarge = totalCA - totalCout;
    const totalPertes = pertes.reduce((s, p) => s + (p.cost || 0), 0);
    const chargesMensuel = charges
      .filter((c) => c.period === "Mensuel")
      .reduce((s, c) => s + c.amount, 0);

    const html = `
      <div class="kpi"><div class="kpi-label">Chiffre d'affaires</div><div class="kpi-value">${
        totalCA.toFixed(2) + " €"
      }</div></div>
      <div class="kpi"><div class="kpi-label">Marge nette</div><div class="kpi-value">${
        totalMarge.toFixed(2) + " €"
      }</div></div>
      <div class="kpi"><div class="kpi-label">Commandes</div><div class="kpi-value">${
        orders.length
      }</div></div>
      <div class="kpi"><div class="kpi-label">Pertes</div><div class="kpi-value">${
        totalPertes.toFixed(2) + " €"
      }</div></div>
      <div class="kpi"><div class="kpi-label">Charges / mois</div><div class="kpi-value">${
        chargesMensuel.toFixed(2) + " €"
      }</div></div>

      <h2>Commandes</h2>
      <table><tr><th>Date</th><th>Recette</th><th>Client</th><th>Qté</th><th>Prix</th><th>Marge</th><th>Statut</th></tr>
      ${orders
        .map(
          (o) =>
            `<tr><td>${o.date || ""}</td><td>${o.recipeName}</td><td>${
              o.client || "—"
            }</td><td>${o.quantity}</td><td>${
              (o.price || 0).toFixed(2) + " €"
            }</td><td>${
              (o.price || 0).toFixed(2) + " €" - (o.cost || 0)
            }</td><td>${o.status}</td></tr>`
        )
        .join("")}
      </table>

      <h2>Pertes enregistrées</h2>
      <table><tr><th>Date</th><th>Type</th><th>Nom</th><th>Quantité</th><th>Coût</th><th>Raison</th></tr>
      ${pertes
        .map(
          (p) =>
            `<tr><td>${p.date || ""}</td><td>${p.type}</td><td>${
              p.name
            }</td><td>${p.quantity}</td><td>${
              (p.cost || 0).toFixed(2) + " €"
            }</td><td>${p.reason || "—"}</td></tr>`
        )
        .join("")}
      </table>

      <h2>Charges fixes</h2>
      <table><tr><th>Charge</th><th>Montant</th><th>Fréquence</th></tr>
      ${charges
        .map(
          (c) =>
            `<tr><td>${c.name}</td><td>${c.amount.toFixed(2) + " €"}</td><td>${
              c.period
            }</td></tr>`
        )
        .join("")}
      </table>
    `;
    printSection(html, "Bilan complet");
  };

  const exportListeCoursePDF = () => {
    const aCommander = ingredients.filter((i) => i.stock <= 2000);
    const html = `
      <h2>🛒 Liste de courses — Stocks faibles</h2>
      <table><tr><th>Ingrédient</th><th>Stock actuel</th><th>Fournisseur</th><th>Contact</th></tr>
      ${aCommander
        .map((i) => {
          const fourn = fournisseurs?.find((f) =>
            f.ingredients?.find((x) => x.name === i.name)
          );
          return `<tr><td><b>${i.name}</b></td><td style="color:#e53935">${
            i.stock
          } g</td><td>${fourn?.nom || "—"}</td><td>${
            fourn?.tel || fourn?.email || "—"
          }</td></tr>`;
        })
        .join("")}
      </table>

      <h2>📖 Recettes et coûts</h2>
      <table><tr><th>Recette</th><th>Portions</th><th>Coût/pièce</th><th>Prix conseillé</th><th>Marge</th></tr>
      ${recipes
        .map(
          (r) =>
            `<tr><td>${r.name}</td><td>${r.portions}</td><td>${
              (r.costPerUnit || 0).toFixed(2) + " €"
            }</td><td>${(r.suggestedPrice || 0).toFixed(2) + " €"}</td><td>${
              (r.suggestedPrice || 0).toFixed(2) + " €" - (r.costPerUnit || 0)
            }</td></tr>`
        )
        .join("")}
      </table>
    `;
    printSection(html, "Liste de courses + Recettes");
  };

  const exportPlanningPDF = () => {
    const sorted = [...planning].sort((a, b) => a.date.localeCompare(b.date));
    const html = `
      <h2>📅 Planning de production</h2>
      <table><tr><th>Date</th><th>Recette</th><th>Quantité</th><th>Note</th><th>Statut</th></tr>
      ${sorted
        .map(
          (p) =>
            `<tr><td>${new Date(p.date).toLocaleDateString("fr-FR")}</td><td>${
              p.recipe
            }</td><td>${p.quantity} pcs</td><td>${p.note || "—"}</td><td>${
              p.done ? "✅ Fait" : "⏳ À faire"
            }</td></tr>`
        )
        .join("")}
      </table>
    `;
    printSection(html, "Planning de production");
  };

  // Stats rapides
  const totalCA = orders.reduce((s, o) => s + (o.price || 0), 0);
  const totalMarge = totalCA - orders.reduce((s, o) => s + (o.cost || 0), 0);
  const totalPertes = pertes.reduce((s, p) => s + (p.cost || 0), 0);

  const exports = [
    {
      section: "📊 PDF — Rapports imprimables",
      items: [
        {
          label: "Bilan complet",
          desc: "CA, marge, commandes, pertes, charges",
          icon: "📊",
          action: exportBilanPDF,
          color: PINK,
        },
        {
          label: "Liste de courses + Recettes",
          desc: "Stocks faibles avec fournisseurs + fiches recettes",
          icon: "🛒",
          action: exportListeCoursePDF,
          color: "#f4a261",
        },
        {
          label: "Planning de production",
          desc: "Toutes les tâches planifiées avec statut",
          icon: "📅",
          action: exportPlanningPDF,
          color: "#2a9d8f",
        },
      ],
    },
    {
      section: "📁 CSV — Fichiers pour Excel / comptabilité",
      items: [
        {
          label: "Commandes clients",
          desc: `${orders.length} commandes`,
          icon: "🛒",
          action: exportCommandesCSV,
          color: "#457b9d",
        },
        {
          label: "Recettes et coûts",
          desc: `${recipes.length} recettes`,
          icon: "📖",
          action: exportRecettesCSV,
          color: "#7b1fa2",
        },
        {
          label: "Stocks ingrédients",
          desc: `${ingredients.length} ingrédients`,
          icon: "🧂",
          action: exportStocksCSV,
          color: "#2e7d32",
        },
        {
          label: "Pertes",
          desc: `${pertes.length} pertes enregistrées`,
          icon: "🗑️",
          action: exportPertesCSV,
          color: "#e53935",
        },
        {
          label: "Charges fixes",
          desc: `${charges.length} charges`,
          icon: "💳",
          action: exportChargesCSV,
          color: "#f57f17",
        },
        {
          label: "Historique des prix",
          desc: `${prixHistorique.length} modifications`,
          icon: "📜",
          action: exportPrixHistoriqueCSV,
          color: "#00838f",
        },
        {
          label: "Commandes fournisseurs",
          desc: `${commandesFourn.length} commandes passées`,
          icon: "🏭",
          action: exportCommandesFournCSV,
          color: "#5d4037",
        },
      ],
    },
  ];

  return (
    <div>
      {/* KPIs résumé */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <KPI title="💰 CA total" value={totalCA.toFixed(2) + " €"} />
        <KPI
          title="📈 Marge totale"
          value={totalMarge.toFixed(2) + " €"}
          accent={totalMarge >= 0 ? "#2e7d32" : "#e53935"}
        />
        <KPI title="🛒 Commandes" value={orders.length} />
        <KPI
          title="🗑️ Pertes"
          value={totalPertes.toFixed(2) + " €"}
          accent={DANGER}
        />
      </div>

      {exports.map((section, si) => (
        <div key={si} style={S.card}>
          <div
            style={{
              fontWeight: 700,
              color: DARK,
              fontSize: 16,
              marginBottom: 16,
            }}
          >
            {section.section}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))",
              gap: 12,
            }}
          >
            {section.items.map((item, ii) => (
              <div
                key={ii}
                style={{
                  background: "#F8FAFC",
                  borderRadius: 14,
                  padding: "16px 20px",
                  border: `1.5px solid ${item.color}33`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: DARK }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 12, color: "#888" }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
                <button
                  style={{
                    ...btn(),
                    background: item.color,
                    fontSize: 13,
                    marginTop: 4,
                  }}
                  onClick={item.action}
                >
                  ⬇️ Télécharger
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Note comptabilité */}
      <div
        style={{
          ...S.card,
          background: "#f3e5f5",
          border: "1.5px solid #ce93d8",
        }}
      >
        <div style={{ fontWeight: 700, color: "#7b1fa2", marginBottom: 8 }}>
          💡 Astuce comptabilité
        </div>
        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>
          Les fichiers CSV s'ouvrent directement dans <b>Excel</b> ou{" "}
          <b>Google Sheets</b>.<br />
          Les PDF utilisent l'impression de ton navigateur — tu peux choisir
          "Enregistrer en PDF" dans les options d'impression.
          <br />
          Pour ta comptabilité mensuelle, exporte{" "}
          <b>Commandes + Charges + Pertes</b> et donne-les à ton comptable.
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS PAGE ─────────────────────────────────────────────────────────────
function SettingsPage() {
  return (
    <div>
      <div style={S.card}>
        <div
          style={{
            fontWeight: 700,
            color: DARK,
            fontSize: 16,
            marginBottom: 4,
          }}
        >
          ⚙️ Réglages
        </div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>
          Personnalisez votre Knead
        </div>
        <div style={{ borderTop: "1px solid #fce4ec", paddingTop: 20 }}>
          <div style={{ fontWeight: 700, color: DARK, marginBottom: 6 }}>
            📦 Seuil d'alerte stock
          </div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>
            Actuellement : alerte si stock ≤ 2 000 g.
          </div>
          <div
            style={{
              background: "#F1F5F9",
              borderRadius: 10,
              padding: "10px 16px",
              fontSize: 13,
              color: SLATE,
            }}
          >
            💡 Pour modifier le seuil, cherchez <code>const ALERT = 2000</code>{" "}
            en haut du fichier App.jsx
          </div>
        </div>
      </div>
      <div
        style={{
          ...S.card,
          background: "#f3e5f5",
          border: "1.5px solid #ce93d8",
        }}
      >
        <div style={{ fontWeight: 700, color: "#7b1fa2", marginBottom: 8 }}>
          ℹ️ À propos
        </div>
        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.8 }}>
          <b>Knead</b> — Application de gestion pour pâtissiers
          <br />
          Données stockées localement dans votre navigateur (localStorage)
          <br />
          Pensé pour Sydney 🇦🇺 — fonctionne aussi partout dans le monde
        </div>
      </div>
    </div>
  );
}

// ── SHOPIFY PAGE ──────────────────────────────────────────────────────────────
function ShopifyPage({
  shopifyConfig,
  setShopifyConfig,
  shopifyOrders,
  setShopifyOrders,
  orders,
  setOrders,
  recipes,
  ingredients,
  setIngredients,
  cur,
}) {
  const [form, setForm] = useState({
    storeUrl: shopifyConfig.storeUrl || "",
    accessToken: shopifyConfig.accessToken || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tab, setTab] = useState("config");
  const [importLoading, setImportLoading] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);

  const ff = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  // Test connection
  const testConnection = async () => {
    if (!form.storeUrl || !form.accessToken) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const store = form.storeUrl
        .replace("https://", "")
        .replace("/", "")
        .replace(".myshopify.com", "");
      // Using allorigins as CORS proxy for browser testing
      // In production, replace with your backend endpoint
      const url = `https://corsproxy.io/?https://${store}.myshopify.com/admin/api/2024-01/shop.json`;
      const res = await fetch(url, {
        headers: {
          "X-Shopify-Access-Token": form.accessToken,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok)
        throw new Error(`Erreur ${res.status} — vérifiez vos identifiants`);
      const data = await res.json();
      setShopifyConfig({
        ...shopifyConfig,
        storeUrl: form.storeUrl,
        accessToken: form.accessToken,
        enabled: true,
        shopName: data.shop?.name,
      });
      setSuccess(`✅ Connecté à "${data.shop?.name || form.storeUrl}" !`);
      setTab("sync");
    } catch (e) {
      setError(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Shopify orders
  const fetchOrders = async () => {
    setImportLoading(true);
    setError(null);
    try {
      const store = shopifyConfig.storeUrl
        .replace("https://", "")
        .replace("/", "")
        .replace(".myshopify.com", "");
      const url = `https://corsproxy.io/?https://${store}.myshopify.com/admin/api/2024-01/orders.json?status=any&limit=50`;
      const res = await fetch(url, {
        headers: { "X-Shopify-Access-Token": shopifyConfig.accessToken },
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setShopifyOrders(data.orders || []);
      setSuccess(`✅ ${data.orders?.length || 0} commandes récupérées`);
    } catch (e) {
      setError(`❌ ${e.message}`);
    } finally {
      setImportLoading(false);
    }
  };

  // Import selected Shopify orders into app
  const importOrders = () => {
    const toImport = shopifyOrders.filter((o) => selectedOrders.includes(o.id));
    const existing = new Set(orders.map((o) => o.shopifyId));
    let imported = 0;

    const newOrders = toImport
      .filter((so) => !existing.has(String(so.id)))
      .map((so) => {
        imported++;
        // Map Shopify line items to our order format
        const items =
          so.line_items?.map((li) => li.title).join(", ") || "Commande Shopify";
        const recipe = recipes.find((r) =>
          so.line_items?.some((li) =>
            li.title.toLowerCase().includes(r.name.toLowerCase())
          )
        );
        return {
          recipeName: recipe?.name || items,
          quantity: so.line_items?.reduce((s, li) => s + li.quantity, 0) || 1,
          price: parseFloat(so.total_price || 0),
          cost: recipe
            ? recipe.costPerUnit * (so.line_items?.[0]?.quantity || 1)
            : 0,
          client:
            `${so.customer?.first_name || ""} ${
              so.customer?.last_name || ""
            }`.trim() || "Client Shopify",
          note: `Shopify #${so.order_number}`,
          date: new Date(so.created_at).toLocaleDateString("fr-FR"),
          status: so.fulfillment_status === "fulfilled" ? "Livré" : "En cours",
          shopifyId: String(so.id),
          shopifyOrderNumber: so.order_number,
          source: "shopify",
        };
      });

    if (newOrders.length > 0) {
      // Déduire du stock pour chaque commande importée
      newOrders.forEach((order) => {
        const recipe = recipes.find((r) => r.name === order.recipeName);
        if (recipe) {
          recipe.ingredients?.forEach((ing) => {
            setIngredients((prev) =>
              prev.map((i) =>
                i.name === ing.name
                  ? {
                      ...i,
                      stock: Math.max(
                        0,
                        i.stock - ing.quantity * order.quantity
                      ),
                    }
                  : i
              )
            );
          });
        }
      });
      setOrders((prev) => [...prev, ...newOrders]);
    }

    setShopifyConfig((prev) => ({
      ...prev,
      lastSync: new Date().toISOString(),
    }));
    setSuccess(
      `✅ ${newOrders.length} commande(s) importée(s) — ${
        toImport.length - newOrders.length
      } déjà existante(s)`
    );
    setSelectedOrders([]);
  };

  // Toggle select all
  const toggleAll = () => {
    if (selectedOrders.length === shopifyOrders.length) setSelectedOrders([]);
    else setSelectedOrders(shopifyOrders.map((o) => o.id));
  };

  const importedIds = new Set(
    orders.filter((o) => o.shopifyId).map((o) => o.shopifyId)
  );

  return (
    <div>
      {/* Header Shopify */}
      <div
        style={{
          ...S.card,
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          border: "none",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#95BF47",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 900,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            S
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>
              Intégration Shopify
            </div>
            <div style={{ color: "#94A3B8", fontSize: 13, marginTop: 2 }}>
              {shopifyConfig.enabled
                ? `✅ Connecté à ${
                    shopifyConfig.shopName || shopifyConfig.storeUrl
                  } · Dernière sync : ${
                    shopifyConfig.lastSync
                      ? new Date(shopifyConfig.lastSync).toLocaleString("fr-FR")
                      : "jamais"
                  }`
                : "Connectez votre boutique Shopify pour importer les commandes automatiquement"}
            </div>
          </div>
          {shopifyConfig.enabled && (
            <div
              style={{
                marginLeft: "auto",
                background: "#95BF47",
                color: "#fff",
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Actif
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { id: "config", label: "⚙️ Configuration" },
          { id: "sync", label: "🔄 Synchronisation" },
          { id: "history", label: "📋 Commandes importées" },
        ].map((t) => (
          <button
            key={t.id}
            style={btn(tab === t.id)}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      {error && (
        <div
          style={{
            ...S.card,
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#DC2626",
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          style={{
            ...S.card,
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            color: "#16A34A",
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          {success}
        </div>
      )}

      {/* ── CONFIG ── */}
      {tab === "config" && (
        <div style={S.card}>
          <div
            style={{
              fontWeight: 700,
              color: NAVY,
              fontSize: 16,
              marginBottom: 6,
            }}
          >
            🔑 Identifiants Shopify
          </div>
          <div
            style={{
              fontSize: 13,
              color: SLATE,
              marginBottom: 20,
              background: "#F8FAFC",
              borderRadius: 8,
              padding: "12px 16px",
              border: `1px solid ${BORDER}`,
            }}
          >
            <b>Comment obtenir votre token :</b>
            <br />
            1. Dans Shopify Admin → Paramètres → Applications → Développer des
            apps
            <br />
            2. Créer une app → Configurer les permissions Admin API
            <br />
            3. Activer : <code>read_orders</code>, <code>read_products</code>,{" "}
            <code>read_inventory</code>
            <br />
            4. Installer l'app → copier le "Admin API access token"
            <br />
            <br />
            <b>⚠️ Note :</b> En version de test, la connexion passe par un proxy
            CORS. En production, elle utilisera votre backend sécurisé.
          </div>

          <div style={S.row}>
            <div style={{ flex: 2 }}>
              <label style={S.label}>URL de votre boutique Shopify</label>
              <input
                style={S.input}
                placeholder="ma-boutique.myshopify.com"
                value={form.storeUrl}
                onChange={(e) => ff("storeUrl", e.target.value)}
              />
            </div>
            <div style={{ flex: 2 }}>
              <label style={S.label}>Admin API Access Token</label>
              <input
                style={{ ...S.input, fontFamily: "monospace" }}
                type="password"
                placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
                value={form.accessToken}
                onChange={(e) => ff("accessToken", e.target.value)}
              />
            </div>
            <div>
              <button
                style={{ ...btn(), background: "#95BF47", marginTop: 24 }}
                onClick={testConnection}
                disabled={loading}
              >
                {loading ? "⏳ Test..." : "🔗 Tester la connexion"}
              </button>
            </div>
          </div>

          {shopifyConfig.enabled && (
            <div
              style={{
                marginTop: 20,
                padding: "16px",
                background: "#F0FDF4",
                borderRadius: 10,
                border: "1px solid #BBF7D0",
              }}
            >
              <div
                style={{ fontWeight: 700, color: "#16A34A", marginBottom: 8 }}
              >
                ✅ Boutique connectée : {shopifyConfig.shopName}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  style={{ ...btn(), background: "#95BF47" }}
                  onClick={() => setTab("sync")}
                >
                  🔄 Aller à la synchronisation
                </button>
                <button
                  style={btn(false, true)}
                  onClick={() =>
                    setShopifyConfig({
                      storeUrl: "",
                      accessToken: "",
                      enabled: false,
                      lastSync: null,
                    })
                  }
                >
                  Déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SYNC ── */}
      {tab === "sync" && (
        <div>
          {!shopifyConfig.enabled ? (
            <div
              style={{
                ...S.card,
                textAlign: "center",
                padding: 40,
                color: SLATE,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔗</div>
              <div style={{ fontWeight: 600 }}>
                Connectez d'abord votre boutique dans l'onglet Configuration
              </div>
            </div>
          ) : (
            <div>
              <div style={{ ...S.card, marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: NAVY, fontSize: 15 }}>
                      📥 Importer les commandes Shopify
                    </div>
                    <div style={{ fontSize: 13, color: SLATE, marginTop: 4 }}>
                      Récupère les 50 dernières commandes · Évite les doublons
                      automatiquement
                    </div>
                  </div>
                  <button
                    style={{ ...btn(), background: "#95BF47" }}
                    onClick={fetchOrders}
                    disabled={importLoading}
                  >
                    {importLoading
                      ? "⏳ Chargement..."
                      : "🔄 Récupérer les commandes"}
                  </button>
                </div>
              </div>

              {shopifyOrders.length > 0 && (
                <div style={S.card}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    <div style={{ fontWeight: 700, color: NAVY }}>
                      {shopifyOrders.length} commandes trouvées
                      {selectedOrders.length > 0 && (
                        <span style={{ color: ACCENT, marginLeft: 8 }}>
                          · {selectedOrders.length} sélectionnée(s)
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={btn(false)} onClick={toggleAll}>
                        {selectedOrders.length === shopifyOrders.length
                          ? "Tout désélectionner"
                          : "Tout sélectionner"}
                      </button>
                      {selectedOrders.length > 0 && (
                        <button
                          style={{ ...btn(), background: "#95BF47" }}
                          onClick={importOrders}
                        >
                          ⬇️ Importer {selectedOrders.length} commande(s)
                        </button>
                      )}
                    </div>
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={S.tableHead}>
                        <th style={{ ...S.tableTd, width: 40 }}></th>
                        {[
                          "#",
                          "Client",
                          "Produits",
                          "Total",
                          "Date",
                          "Statut",
                          "",
                        ].map((h) => (
                          <th
                            key={h}
                            style={{ ...S.tableTd, textAlign: "left" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {shopifyOrders.map((so, i) => {
                        const alreadyImported = importedIds.has(String(so.id));
                        const selected = selectedOrders.includes(so.id);
                        return (
                          <tr
                            key={i}
                            style={{
                              opacity: alreadyImported ? 0.5 : 1,
                              background: selected ? "#EFF6FF" : "transparent",
                            }}
                          >
                            <td style={S.tableTd}>
                              {!alreadyImported && (
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() =>
                                    setSelectedOrders((prev) =>
                                      selected
                                        ? prev.filter((id) => id !== so.id)
                                        : [...prev, so.id]
                                    )
                                  }
                                />
                              )}
                            </td>
                            <td
                              style={{
                                ...S.tableTd,
                                fontWeight: 700,
                                color: ACCENT,
                              }}
                            >
                              #{so.order_number}
                            </td>
                            <td style={S.tableTd}>
                              {so.customer?.first_name} {so.customer?.last_name}
                            </td>
                            <td
                              style={{
                                ...S.tableTd,
                                fontSize: 12,
                                color: SLATE,
                              }}
                            >
                              {so.line_items
                                ?.map((li) => `${li.quantity}× ${li.title}`)
                                .join(", ")
                                .slice(0, 50)}
                              {(so.line_items?.map((li) => li.title).join(", ")
                                .length || 0) > 50
                                ? "…"
                                : ""}
                            </td>
                            <td style={{ ...S.tableTd, fontWeight: 700 }}>
                              {cur(so.total_price)}
                            </td>
                            <td
                              style={{
                                ...S.tableTd,
                                fontSize: 12,
                                color: SLATE,
                              }}
                            >
                              {new Date(so.created_at).toLocaleDateString(
                                "fr-FR"
                              )}
                            </td>
                            <td style={S.tableTd}>
                              <span
                                style={{
                                  background:
                                    so.fulfillment_status === "fulfilled"
                                      ? "#F0FDF4"
                                      : "#FFFBEB",
                                  color:
                                    so.fulfillment_status === "fulfilled"
                                      ? SUCCESS
                                      : WARNING,
                                  borderRadius: 8,
                                  padding: "3px 10px",
                                  fontSize: 12,
                                  fontWeight: 700,
                                }}
                              >
                                {so.fulfillment_status === "fulfilled"
                                  ? "Livré"
                                  : "En attente"}
                              </span>
                            </td>
                            <td style={S.tableTd}>
                              {alreadyImported && (
                                <span
                                  style={{
                                    fontSize: 12,
                                    color: SUCCESS,
                                    fontWeight: 600,
                                  }}
                                >
                                  ✅ Importé
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sync stock info */}
              <div
                style={{
                  ...S.card,
                  background: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                }}
              >
                <div
                  style={{ fontWeight: 700, color: ACCENT, marginBottom: 8 }}
                >
                  🔄 Synchronisation du stock
                </div>
                <div style={{ fontSize: 13, color: SLATE, lineHeight: 1.7 }}>
                  Lors de l'import, le stock des ingrédients est automatiquement
                  déduit selon les recettes associées.
                  <br />
                  <b>Pour une sync parfaite :</b> associez le nom de vos
                  produits Shopify aux noms de vos recettes dans l'app.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── HISTORY ── */}
      {tab === "history" && (
        <div style={S.card}>
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 14 }}>
            📋 Commandes importées depuis Shopify
          </div>
          {orders.filter((o) => o.source === "shopify").length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: SLATE }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
              <div>Aucune commande Shopify importée</div>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={S.tableHead}>
                  {[
                    "# Shopify",
                    "Recette",
                    "Client",
                    "Prix",
                    "Date",
                    "Statut",
                  ].map((h) => (
                    <th key={h} style={{ ...S.tableTd, textAlign: "left" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders
                  .filter((o) => o.source === "shopify")
                  .reverse()
                  .map((o, i) => (
                    <tr key={i}>
                      <td
                        style={{ ...S.tableTd, fontWeight: 700, color: ACCENT }}
                      >
                        {o.shopifyOrderNumber
                          ? `#${o.shopifyOrderNumber}`
                          : "—"}
                      </td>
                      <td style={S.tableTd}>{o.recipeName}</td>
                      <td style={S.tableTd}>{o.client}</td>
                      <td style={{ ...S.tableTd, fontWeight: 700 }}>
                        {cur(o.price)}
                      </td>
                      <td style={{ ...S.tableTd, color: SLATE, fontSize: 12 }}>
                        {o.date}
                      </td>
                      <td style={S.tableTd}>
                        <span
                          style={{
                            background:
                              o.status === "Livré" ? "#F0FDF4" : "#FFFBEB",
                            color: o.status === "Livré" ? SUCCESS : WARNING,
                            borderRadius: 8,
                            padding: "3px 10px",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
