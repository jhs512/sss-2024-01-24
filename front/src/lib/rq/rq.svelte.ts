import { goto } from '$app/navigation';

import type { components, paths } from '$lib/types/api/v1/schema';
import type { Page } from '@sveltejs/kit';
import createClient from 'openapi-fetch';

import toastr from 'toastr';
import 'toastr/build/toastr.css';

toastr.options = {
  showDuration: 300,
  hideDuration: 300,
  timeOut: 3000,
  extendedTimeOut: 1000
};

class Rq {
  public member: components['schemas']['MemberDto'];

  constructor() {
    this.member = this.makeReactivityMember();
  }

  public effect(fn: () => void) {
    $effect(fn);
  }

  public isAdmin() {
    if (this.isLogout()) return false;

    return this.member.authorities.includes('ROLE_ADMIN');
  }

  public isAdmPage($page: Page<Record<string, string>>) {
    return $page.url.pathname.startsWith('/adm');
  }

  public isUsrPage($page: Page<Record<string, string>>) {
    return !this.isAdmPage($page);
  }

  // URL
  public goTo(url: string) {
    goto(url);
  }

  public replace(url: string) {
    goto(url, { replaceState: true });
  }

  public reload() {
    this.replace('/redirect?url=' + window.location.href);
  }

  // API END POINTS
  public apiEndPoints() {
    return createClient<paths>({
      baseUrl: import.meta.env.VITE_CORE_API_BASE_URL,
      credentials: 'include'
    });
  }

  // MSG, REDIRECT
  public msgAndRedirect(
    data: { msg: string } | undefined,
    error: { msg: string } | undefined,
    url: string,
    callback?: () => void
  ) {
    if (data) this.msgInfo(data.msg);
    if (error) this.msgError(error.msg);

    this.replace(url);

    if (callback) window.setTimeout(callback, 100);
  }

  public msgInfo(message: string) {
    toastr.info(message);
  }

  public msgError(message: string) {
    toastr.error(message);
  }

  // 인증
  // 이렇게 member 를 만들면 좋은 점이 있다.
  // member 의 값이 바뀌면, member 를 사용하는 모든 곳에서 자동으로 즉각 반영된다.
  public makeReactivityMember() {
    let id = $state(0);
    let name = $state('');
    let profileImgUrl = $state('');
    let createDate = $state('');
    let modifyDate = $state('');
    let authorities: string[] = $state([]);

    return {
      get id() {
        return id;
      },
      set id(value: number) {
        id = value;
      },
      get createDate() {
        return createDate;
      },
      set createDate(value: string) {
        createDate = value;
      },
      get modifyDate() {
        return modifyDate;
      },
      set modifyDate(value: string) {
        modifyDate = value;
      },
      get name() {
        return name;
      },
      set name(value: string) {
        name = value;
      },
      get profileImgUrl() {
        return profileImgUrl;
      },
      set profileImgUrl(value: string) {
        profileImgUrl = value;
      },
      get authorities() {
        return authorities;
      },
      set authorities(value: string[]) {
        authorities = value;
      }
    };
  }

  public setLogined(member: components['schemas']['MemberDto']) {
    Object.assign(this.member, member);
  }

  public setLogout() {
    this.member.id = 0;
    this.member.createDate = '';
    this.member.modifyDate = '';
    this.member.name = '';
    this.member.profileImgUrl = '';
    this.member.authorities = [];
  }

  public isLogin() {
    return this.member.id !== 0;
  }

  public isLogout() {
    return !this.isLogin();
  }

  public async initAuth() {
    const { data } = await this.apiEndPoints().GET('/api/v1/members/me');

    if (data) {
      this.setLogined(data.data.item);
    }
  }

  public async logoutAndRedirect(url: string) {
    await this.apiEndPoints().POST('/api/v1/members/logout');

    this.setLogout();
    this.replace(url);
  }

  public getKakaoLoginUrl() {
    return `${
      import.meta.env.VITE_CORE_API_BASE_URL
    }/member/socialLogin/kakao?redirectUrl=${encodeURIComponent(
      import.meta.env.VITE_CORE_FRONT_BASE_URL
    )}/member/socialLoginCallback?provierTypeCode=kakao`;
  }

  public getGoogleLoginUrl() {
    return `${
      import.meta.env.VITE_CORE_API_BASE_URL
    }/member/socialLogin/google?redirectUrl=${encodeURIComponent(
      import.meta.env.VITE_CORE_FRONT_BASE_URL
    )}/member/socialLoginCallback?provierTypeCode=google`;
  }
}

const rq = new Rq();

export default rq;
