export type PrologueLine = {
  speaker: string;
  text: string;
};

export type PrologueScene = {
  id: string;
  title: string;
  backgroundAssetId: string;
  lines: PrologueLine[];
  hime?: "normal" | "surprised";
  grandma?: boolean;
  shiro?: boolean;
  shadow?: boolean;
  pendant?: "full" | "empty";
  steam?: boolean;
  anomaly?: boolean;
};
