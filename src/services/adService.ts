import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdSize, BannerAdPosition, AdmobConsentStatus } from '@capacitor-community/admob';
import type { BannerAdOptions } from '@capacitor-community/admob';

// Ad Unit IDs - Replace with your actual AdMob IDs in production
const AD_UNIT_IDS = {
  banner: {
    android: 'ca-app-pub-3940256099942544/6300978111', // Test ID
    ios: 'ca-app-pub-3940256099942544/2934735716', // Test ID
  },
  interstitial: {
    android: 'ca-app-pub-3940256099942544/1033173712', // Test ID
    ios: 'ca-app-pub-3940256099942544/4411468910', // Test ID
  },
  rewarded: {
    android: 'ca-app-pub-3940256099942544/5224354917', // Test ID
    ios: 'ca-app-pub-3940256099942544/1712485313', // Test ID
  },
};

class AdService {
  private initialized: boolean = false;
  private isNative: boolean = false;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (this.isNative) {
      try {
        await AdMob.initialize({
          initializeForTesting: true, // Set to false in production
        });

        // Request consent for personalized ads (GDPR compliance)
        const consentInfo = await AdMob.requestConsentInfo();
        if (consentInfo.isConsentFormAvailable && consentInfo.status === AdmobConsentStatus.REQUIRED) {
          await AdMob.showConsentForm();
        }

        this.initialized = true;
        console.log('AdMob initialized successfully');
      } catch (error) {
        console.error('Failed to initialize AdMob:', error);
      }
    } else {
      // For PWA, we'll use Google AdSense
      // AdSense script should be added in index.html
      this.initialized = true;
      console.log('AdSense mode for PWA');
    }
  }

  async showBanner(): Promise<void> {
    if (!this.isNative) {
      // For PWA, AdSense banners are handled via HTML
      return;
    }

    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const options: BannerAdOptions = {
        adId: Capacitor.getPlatform() === 'android' 
          ? AD_UNIT_IDS.banner.android 
          : AD_UNIT_IDS.banner.ios,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: true, // Set to false in production
      };

      await AdMob.showBanner(options);
    } catch (error) {
      console.error('Failed to show banner:', error);
    }
  }

  async hideBanner(): Promise<void> {
    if (!this.isNative) return;

    try {
      await AdMob.hideBanner();
    } catch (error) {
      console.error('Failed to hide banner:', error);
    }
  }

  async showInterstitial(): Promise<void> {
    if (!this.isNative) {
      // For PWA, show a custom interstitial or skip
      console.log('Interstitial ads not available in PWA mode');
      return;
    }

    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const adId = Capacitor.getPlatform() === 'android'
        ? AD_UNIT_IDS.interstitial.android
        : AD_UNIT_IDS.interstitial.ios;

      await AdMob.prepareInterstitial({
        adId,
        isTesting: true, // Set to false in production
      });

      await AdMob.showInterstitial();
    } catch (error) {
      console.error('Failed to show interstitial:', error);
    }
  }

  async showRewardedAd(): Promise<boolean> {
    if (!this.isNative) {
      console.log('Rewarded ads not available in PWA mode');
      return false;
    }

    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const adId = Capacitor.getPlatform() === 'android'
        ? AD_UNIT_IDS.rewarded.android
        : AD_UNIT_IDS.rewarded.ios;

      await AdMob.prepareRewardVideoAd({
        adId,
        isTesting: true, // Set to false in production
      });

      const result = await AdMob.showRewardVideoAd();
      return result.type === 'rewarded';
    } catch (error) {
      console.error('Failed to show rewarded ad:', error);
      return false;
    }
  }

  isNativePlatform(): boolean {
    return this.isNative;
  }
}

// Singleton instance
let adServiceInstance: AdService | null = null;

export function getAdService(): AdService {
  if (!adServiceInstance) {
    adServiceInstance = new AdService();
  }
  return adServiceInstance;
}
