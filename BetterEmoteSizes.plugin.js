//META{"name":"BetterEmoteSizes","website":"https://github.com/cmd430/BetterEmoteSizes","source":"https://github.com/cmd430/BetterEmoteSizes/blob/master/BetterEmoteSizes.plugin.js"}*//

class BetterEmoteSizes {

	getName() { return "BetterEmoteSizes"; }
	getDescription() { return "Increases the size of emojis, emotes, and reactions upon hovering over them and allows you to change their default sizes."; }
	getVersion() { return "2.4.18"; }
	getAuthor() { return "Metalloriff, Patched by cmd430"; }

	get settingFields() {
		return {
			alterSmall: { label: "Affect small emojis", type: "bool" },
			smallSize: { label: "Default small emoji size (px)", type: "number" },
			alterLarge: { label: "Affect large emojis", type: "bool" },
			largeSize: { label: "Default large emoji size (px)", type: "number" },
			alterBD: { label: "Affect small BetterDiscord emotes", type: "bool" },
			bdSize: { label: "Default small BetterDiscord emote size (px)", type: "number" },
			alterLargeBD: { label: "Affect large BetterDiscord emotes", type: "bool" },
			largeBdSize: { label: "Default large BetterDiscord emote size (px)", type: "number" },
			alterReactions: { label: "Affect reactions", type: "bool" },
			reactionSize: { label: "Default reaction size (px)", type: "number" },
			hoverSize: { label: "Emoji and BetterDiscord emote hover size multiplier", type: "number" },
			reactionHoverSize: { label: "Reaction hover size multiplier", type: "number" },
			transitionSpeed: { label: "Transition speed (seconds)", type: "number" },
			delayAmount: { label: "Delay amount (seconds)", type: "number" },
			equal: { label: "Small and large emote zoom to equal", type: "bool" }
		};
	}

	get defaultSettings() {
		return {
			displayUpdateNotes: true,
			alterSmall: true,
			smallSize: 22,
			alterLarge: true,
			largeSize: 32,
			alterBD: true,
			bdSize: 28,
			alterLargeBD: true,
			largeBdSize: 32,
			alterReactions: true,
			reactionSize: 16,
			hoverSize: 3,
			transitionSpeed: 0.5,
			delayAmount: 0,
			reactionHoverSize: 2,
			equal: false
		};
	}

	getSettingsPanel() {
		return NeatoLib.Settings.createPanel(this);
	}

	saveSettings() {
		NeatoLib.Settings.save(this);
		this.update();
	}

	load() {}

	start() {
		const libLoadedEvent = () => {
			try{ this.onLibLoaded(); }
			catch(err) { console.error(this.getName(), "fatal error, plugin could not be started!", err); try { this.stop(); } catch(err) { console.error(this.getName() + ".stop()", err); } }
		};

		let lib = document.getElementById("NeatoBurritoLibrary");
		if (!lib) {
			lib = document.createElement("script");
			lib.id = "NeatoBurritoLibrary";
			lib.type = "text/javascript";
			lib.src = "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js";
			document.head.appendChild(lib);
		}

		this.forceLoadTimeout = setTimeout(libLoadedEvent, 30000);
		if (typeof window.NeatoLib !== "undefined") libLoadedEvent();
		else lib.addEventListener("load", libLoadedEvent);
	}

	onLibLoaded() {
		this.settings = NeatoLib.Settings.load(this);

		NeatoLib.Updates.check(this, "https://raw.githubusercontent.com/cmd430/BetterEmoteSizes/master/BetterEmoteSizes.plugin.js");

		if (!NeatoLib.hasRequiredLibVersion(this, "0.7.19")) return;

		this.update();

		NeatoLib.Events.onPluginLoaded(this);
	}

	update() {
		const markup = NeatoLib.getClass("markup");
		const markupRtl = NeatoLib.getClass("markupRtl");
		const messageGroup = NeatoLib.getClass("cozyMessage");
		const messageContent = NeatoLib.getClass("messageContent");
		const messageAvatar = 'da-avatar'; //NeatoLib.getClass("avatar"); NeatoLib cant get the correct class for this...
		const message = NeatoLib.getClass("message");
		const reaction = NeatoLib.getClass("reaction");
		const reactionMe = NeatoLib.getClass("reactionMe");

		if (this.style) this.style.destroy();
		this.style = NeatoLib.injectCSS(`.${messageGroup}, .${messageContent} { overflow: visible !important; }`);
		this.style.append(`.${messageAvatar} { z-index: 0 !important; }`)

		if (this.settings.alterSmall) {
			this.style.append(`
				#app-mount .${markup} > .emoji:not(.jumboable),
				#app-mount .${markupRtl} > .emoji:not(.jumboable) {
					position: relative;
					height: ${this.settings.smallSize}px;
					width: auto;
					transform: scale(1) translateY(-${this.settings.smallSize / (this.settings.smallSize / 2)}px);
					padding: 2px;
					vertical-align: middle;
					transition: transform ${this.settings.transitionSpeed}s;
					transition-delay: 0s;
				}
				#app-mount .${markup} > .emoji:not(.jumboable):hover,
				#app-mount .${markupRtl} > .emoji:not(.jumboable):hover {
					transform: scale(${this.settings.equal ? ((this.settings.largeSize / this.settings.smallSize) * this.settings.hoverSize) : this.settings.hoverSize})  translateY(-${this.settings.smallSize / (this.settings.smallSize / 2)}px);
					position: relative;
					z-index: 991;
					transition-delay: ${this.settings.delayAmount}s;
				}
				#app-mount .${messageGroup}:last-child .${message}:nth-last-child(2) .${markup} .emoji:not(.jumboable):hover,
				#app-mount .${messageGroup}:last-child .${message}:nth-last-child(2) .${markupRtl} .emoji:not(.jumboable):hover {
					transform: scale(${this.settings.equal ? ((this.settings.largeSize / this.settings.smallSize) * this.settings.hoverSize) : this.settings.hoverSize}) translateY(-35%);
				}
			`);
		}

		if (this.settings.alterLarge) {
			this.style.append(`
				#app-mount .${markup} > .emoji.jumboable,
				#app-mount .${markupRtl} > .emoji.jumboable {
					height: ${this.settings.largeSize}px;
					width: auto;
					transform: scale(1);
					transition: transform ${this.settings.transitionSpeed}s;
					transition-delay: 0s;
				}
				#app-mount .${markup} > .emoji.jumboable:hover,
				#app-mount .${markupRtl} > .emoji.jumboable:hover {
					transform: scale(${this.settings.hoverSize});
					position: relative;
					z-index: 1;
					transition-delay: ${this.settings.delayAmount}s;
				}
				#app-mount .${messageGroup}:last-child .${message}:nth-last-child(2) .${markup} .emoji.jumboable:hover,
				#app-mount .${messageGroup}:last-child .${message}:nth-last-child(2) .${markupRtl} .emoji.jumboable:hover {
					transform: scale(${this.settings.hoverSize}) translateY(-35%);
				}
			`);
		}

		if (this.settings.alterBD) {
			this.style.append(`
				#app-mount .emote:not(.jumboable) {
					position: relative;
					height: ${this.settings.bdSize}px;
					width: auto;
					max-height: ${this.settings.bdSize}px !important;
					transform: scale(1) translateY(-${this.settings.bdSize / (this.settings.bdSize / 2)}px);
					padding: 2px;
					vertical-align: middle;
					transition: transform ${this.settings.transitionSpeed}s;
					transition-delay: 0s;
				}
				#app-mount .emote:not(.emoteshake):not(.emoteshake2):not(.emoteshake3):not(.jumboable):hover {
					transform: scale(${this.settings.hoverSize});
					position: relative;
					z-index: 1;
					transition-delay: ${this.settings.delayAmount}s;
				}
				#app-mount .${messageGroup}:last-child .${message}:nth-last-child(2) .emote:not(.emoteshake):not(.emoteshake2):not(.emoteshake3):not(.jumboable):hover {
					transform: scale(${this.settings.hoverSize}) translateY(-35%);
				}
			`);
		}

		if (this.settings.alterLargeBD) {
			this.style.append(`
				#app-mount .emote.jumboable {
					height: ${this.settings.largeBdSize}px;
					width: auto;
					max-height: ${this.settings.largeBdSize}px !important;
					transform: scale(1);
					transition: transform ${this.settings.transitionSpeed}s;
					transition-delay: 0s;
				}
				#app-mount .emote.jumboable:not(.emoteshake):not(.emoteshake2):not(.emoteshake3):hover {
					transform: scale(${this.settings.hoverSize});
					position: relative;
					z-index: 1;
					transition-delay: ${this.settings.delayAmount}s;
				}
				#app-mount .${messageGroup}:last-child .${message}:nth-last-child(2) .emote.jumboable:not(.emoteshake2):not(.emoteshake3):hover {
					transform: scale(${this.settings.hoverSize}) translateY(-35%);
				}
			`);
		}

		if (this.settings.alterReactions) {
			this.style.append(`
				#app-mount .${reaction} .emoji, .${reaction}.${reactionMe} .emoji {
					height: ${this.settings.reactionSize}px;
					width: auto;
				}
				#app-mount .${reaction} {
					transition: transform ${this.settings.transitionSpeed}s;
					transition-delay: 0s;
				}
				#app-mount .${reaction}:hover {
					transform: scale(${this.settings.reactionHoverSize}) !important;
					z-index: 1000;
					transition-delay: ${this.settings.delayAmount}s;
				}
				#app-mount .${reaction} {
					position: relative;
					overflow: hidden;
				}
				#app-mount .${reaction}::before {
					content: "";
					position: absolute;
					width: 100%;
					height: 100%;
					top: 0;
					left: 0;
					background: rgb(66, 69, 74) !important;
					z-index: -1;
				}
				#app-mount .${reactionMe}::before {
					background: rgb(79, 84, 109) !important;
				}
			`);
		}
	}

	stop() {
		if (this.style) this.style.destroy();
	}

}
