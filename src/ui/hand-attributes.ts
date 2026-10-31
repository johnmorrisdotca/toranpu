import { ElementBase, isOn, writeElementAttribute } from "./element-kit.ts";

/**
 * The attributes a hand reflects: each attribute as a property, and again under
 * its hyphenated name where that differs. `ToranpuHand` adds the cards, the
 * motion and the drawing.
 */
export class HandAttributes extends ElementBase {
  get order(): string | null {
    return this.getAttribute("order");
  }
  set order(value: string | number | readonly string[] | null | undefined) {
    writeElementAttribute(this, "order", value);
  }
  get receive(): string | null {
    return this.getAttribute("receive");
  }
  set receive(value: string | number | readonly string[] | null | undefined) {
    writeElementAttribute(this, "receive", value);
  }
  get dealAfter(): string | null {
    return this.getAttribute("deal-after");
  }
  set dealAfter(value: string | number | readonly string[] | null | undefined) {
    writeElementAttribute(this, "deal-after", value);
  }
  get "deal-after"(): string | null {
    return this.getAttribute("deal-after");
  }
  set "deal-after"(value: string | number | readonly string[] | null | undefined) {
    writeElementAttribute(this, "deal-after", value);
  }
  get faceDown(): boolean {
    return isOn(this, "face-down");
  }
  set faceDown(value: boolean | string | null | undefined) {
    writeElementAttribute(this, "face-down", value, true);
  }
  get "face-down"(): boolean {
    return isOn(this, "face-down");
  }
  set "face-down"(value: boolean | string | null | undefined) {
    writeElementAttribute(this, "face-down", value, true);
  }
  get turned(): string | null {
    return this.getAttribute("turned");
  }
  set turned(value: string | number | readonly string[] | null | undefined) {
    writeElementAttribute(this, "turned", value);
  }
  get scrunched(): boolean {
    return isOn(this, "scrunched");
  }
  set scrunched(value: boolean | string | null | undefined) {
    writeElementAttribute(this, "scrunched", value, true);
  }
  get parted(): string | null {
    return this.getAttribute("parted");
  }
  set parted(value: string | number | readonly string[] | null | undefined) {
    writeElementAttribute(this, "parted", value);
  }
  get marked(): string | null {
    return this.getAttribute("marked");
  }
  set marked(value: string | readonly string[] | null | undefined) {
    writeElementAttribute(this, "marked", value);
  }
  get closed(): string | null {
    return this.getAttribute("closed");
  }
  set closed(value: string | number | readonly string[] | null | undefined) {
    writeElementAttribute(this, "closed", value);
  }
  get reveal(): boolean {
    return isOn(this, "reveal");
  }
  set reveal(value: boolean | string | null | undefined) {
    writeElementAttribute(this, "reveal", value, true);
  }
  get design(): string | null {
    return this.getAttribute("design");
  }
  set design(value: string | number | readonly string[] | null | undefined) {
    writeElementAttribute(this, "design", value);
  }
  get back(): string | null {
    return this.getAttribute("back");
  }
  set back(value: string | number | readonly string[] | null | undefined) {
    writeElementAttribute(this, "back", value);
  }
  get backColour(): string | null {
    return this.getAttribute("back-colour");
  }
  set backColour(value: string | number | readonly string[] | null | undefined) {
    writeElementAttribute(this, "back-colour", value);
  }
  get "back-colour"(): string | null {
    return this.getAttribute("back-colour");
  }
  set "back-colour"(value: string | number | readonly string[] | null | undefined) {
    writeElementAttribute(this, "back-colour", value);
  }
  get backImage(): string | null {
    return this.getAttribute("back-image");
  }
  set backImage(value: string | number | readonly string[] | null | undefined) {
    writeElementAttribute(this, "back-image", value);
  }
  get "back-image"(): string | null {
    return this.getAttribute("back-image");
  }
  set "back-image"(value: string | number | readonly string[] | null | undefined) {
    writeElementAttribute(this, "back-image", value);
  }
  get backLogo(): string | null {
    return this.getAttribute("back-logo");
  }
  set backLogo(value: string | number | readonly string[] | null | undefined) {
    writeElementAttribute(this, "back-logo", value);
  }
  get "back-logo"(): string | null {
    return this.getAttribute("back-logo");
  }
  set "back-logo"(value: string | number | readonly string[] | null | undefined) {
    writeElementAttribute(this, "back-logo", value);
  }
  get size(): string | null {
    return this.getAttribute("size");
  }
  set size(value: string | number | readonly string[] | null | undefined) {
    writeElementAttribute(this, "size", value);
  }
  get width(): string | null {
    return this.getAttribute("width");
  }
  set width(value: string | number | readonly string[] | null | undefined) {
    writeElementAttribute(this, "width", value);
  }
  get theme(): string | null {
    return this.getAttribute("theme");
  }
  set theme(value: string | number | readonly string[] | null | undefined) {
    writeElementAttribute(this, "theme", value);
  }
  get label(): string | null {
    return this.getAttribute("label");
  }
  set label(value: string | number | readonly string[] | null | undefined) {
    writeElementAttribute(this, "label", value);
  }

  get sound(): boolean {
    return isOn(this, "sound");
  }
  set sound(value: boolean | string | null | undefined) {
    writeElementAttribute(this, "sound", value, true);
  }
  static get observedAttributes(): readonly string[] {
    return [
      "cards",
      "order",
      "receive",
      "deal-after",
      "face-down",
      "turned",
      "scrunched",
      "parted",
      "marked",
      "closed",
      "reveal",
      "design",
      "back",
      "back-colour",
      "back-image",
      "back-logo",
      "mark",
      "size",
      "width",
      "lang",
      "theme",
      "label",
      "sound",
    ];
  }
}
