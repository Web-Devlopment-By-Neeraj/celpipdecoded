import { describe, expect, it } from "vitest";
import {
  SPOTLIGHT_IDS,
  TESTIMONIALS,
  biggestJump,
  filterTestimonials,
  resultsStats,
  scoreBand,
  testimonialById,
  testimonialHighlight,
  type Testimonial,
} from "./testimonials";

describe("testimonials", () => {
  it("has unique ids and scores on the CLB scale", () => {
    const ids = new Set(TESTIMONIALS.map((t) => t.id));
    expect(ids.size).toBe(TESTIMONIALS.length);
    for (const testimonial of TESTIMONIALS) {
      for (const score of Object.values(testimonial.scores)) {
        expect(score).toBeGreaterThanOrEqual(1);
        expect(score).toBeLessThanOrEqual(12);
      }
    }
  });

  it("resolves every spotlight id to a story with an earlier result", () => {
    for (const id of SPOTLIGHT_IDS) {
      const testimonial = testimonialById(id);
      expect(testimonial).toBeDefined();
      expect(biggestJump(testimonial!)).toBeDefined();
    }
  });

  it("computes the stats from the cards", () => {
    const stats = resultsStats(TESTIMONIALS);
    expect(stats.shown).toBe(18);
    expect(stats.clb9AllFour).toBe(10);
    expect(stats.perfectTwelve).toBe(4);
    expect(stats.biggest).toEqual({
      name: "Dawinder",
      skill: "reading",
      from: 6,
      to: 10,
    });
  });

  it("filters by result type", () => {
    const all = filterTestimonials(TESTIMONIALS, "all");
    expect(all).toHaveLength(TESTIMONIALS.length);

    const clb9 = filterTestimonials(TESTIMONIALS, "clb9");
    expect(clb9.every((t) => Object.values(t.scores).every((v) => v >= 9))).toBe(true);

    const first = filterTestimonials(TESTIMONIALS, "first-attempt").map((t) => t.id);
    expect(first).toEqual(expect.arrayContaining(["kishan", "gurnoor", "vishal"]));

    const jumps = filterTestimonials(TESTIMONIALS, "jumps").map((t) => t.id);
    expect(jumps).toEqual(expect.arrayContaining([...SPOTLIGHT_IDS]));
  });

  it("bands scores by the CLB 9 goal", () => {
    expect(scoreBand(12)).toBe("high");
    expect(scoreBand(9)).toBe("high");
    expect(scoreBand(8)).toBe("mid");
    expect(scoreBand(7)).toBe("mid");
    expect(scoreBand(6)).toBe("low");
  });

  it("builds a short highlight line", () => {
    expect(testimonialHighlight(testimonialById("kishan")!)).toBe(
      "First attempt · 3 days of prep",
    );
    expect(testimonialHighlight(testimonialById("dawinder")!)).toBe(
      "Reading 6 → 10",
    );
    const plain: Testimonial = {
      id: "x",
      name: "X",
      quote: "",
      proof: "video",
      scores: { listening: 9, reading: 9, writing: 9, speaking: 9 },
    };
    expect(testimonialHighlight(plain)).toBeUndefined();
  });
});
