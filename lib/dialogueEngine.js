// ANTARMUKA DIALOG & KEPUTUSAN KARYAWAN (Dialogue & Decision Interface)
// Mendukung implementasi Rule-based (default) dan siap dihubungkan ke LLM API (Claude / OpenAI / Local AI)

/**
 * Interface dasar untuk Generator Dialog
 */
export class IDialogueProvider {
  /**
   * Menghasilkan pesan dialog percakapan antar NPC
   * @param {Object} context Konteks percakapan (npc1, npc2, location, topic)
   * @returns {Promise<string>}
   */
  async generateDialogue(context) {
    throw new Error("generateDialogue must be implemented");
  }

  /**
   * Menentukan keputusan spontan saat ada kebutuhan mendesak
   * @param {Object} npc Keadaan NPC saat ini
   * @returns {Promise<string|null>}
   */
  async decideNextAction(npc) {
    throw new Error("decideNextAction must be implemented");
  }
}

/**
 * Implementasi Default: Rule-Based Berdasarkan Kepribadian & Database Dialog
 */
export class RuleBasedDialogueProvider extends IDialogueProvider {
  constructor(npcsData) {
    super();
    this.npcsData = npcsData;
  }

  async generateDialogue(context) {
    const { speaker, listener, location, topic } = context;
    const speakerData = this.npcsData.find((n) => n.id === speaker.id);
    if (!speakerData || !speakerData.dialogues) {
      return "Semangat kerjanya ya!";
    }

    const category = topic || (location.includes("Pantry") || location.includes("Lounge") ? "pantry" : location.includes("Meeting") ? "meeting" : "chat");
    const options = speakerData.dialogues[category] || speakerData.dialogues["chat"] || ["Halo!"];
    const chosen = options[Math.floor(Math.random() * options.length)];

    return chosen;
  }

  async decideNextAction(npc) {
    // Evaluasi Needs (Lapar, Energi, Sosial)
    if (npc.needs.hunger > 80) {
      return "eat";
    }
    if (npc.needs.energy < 20) {
      return "coffee";
    }
    if (npc.needs.social < 25) {
      return "chat";
    }
    return null;
  }
}

/**
 * Implementasi LLM (Opsional Siap Pakai untuk Claude / OpenAI API)
 */
export class LLMDialogueProvider extends IDialogueProvider {
  constructor(apiKey, endpoint) {
    super();
    this.apiKey = apiKey;
    this.endpoint = endpoint;
  }

  async generateDialogue(context) {
    // Template integrasi API: jika belum diatur apiKey, fallback ke rule-based
    try {
      if (!this.apiKey) throw new Error("API Key not configured");
      // Contoh pemanggilan LLM nanti:
      // const res = await fetch(this.endpoint, { ... });
      // return await res.text();
    } catch (e) {
      return `Halo! Lagi asyik ngobrol nih di ${context.location}.`;
    }
  }

  async decideNextAction(npc) {
    return null;
  }
}
