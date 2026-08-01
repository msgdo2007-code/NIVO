import { ProfileEditor } from "@/components/profile-editor/profile-editor";
import { getOwnProfileBundle } from "@/features/profiles/queries";

export default async function EditorPage() {
  const { profile, settings, blocks } = await getOwnProfileBundle();
  return <main className="editor-page"><header className="subpage-heading"><span className="eyebrow">Editor visual</span><h1>Monte sua órbita.</h1><p>Adicione, edite, programe e reorganize seus blocos com persistência real.</p></header><ProfileEditor initialBlocks={blocks} profile={profile} settings={settings} /></main>;
}
