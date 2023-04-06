import { _DisposeViewRepeaterStrategy } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  finalize,
  Observable,
  of,
} from 'rxjs';
import { environment } from 'src/enviroments/enviroment';
import { Unsubscriber } from '../unsubscriber';
import { Post } from './post.model';

const BACKEND_URL = environment.apiUrl + '/posts';

@Injectable({ providedIn: 'root' })
export class PostService extends Unsubscriber {
  private postsUpdated = new BehaviorSubject<Post[]>([]);
  private postsCountSource = new BehaviorSubject<number>(0);
  private isLoadingSource = new BehaviorSubject<boolean>(false);
  postUpdated$: Observable<Post[]> = this.postsUpdated.asObservable();
  postCount$: Observable<number> = this.postsCountSource.asObservable();
  isLoading$ = this.isLoadingSource.asObservable();

  constructor(private htttpClient: HttpClient, private router: Router) {
    super();
  }

  getPost(id: string): Observable<Post> {
    this.isLoadingSource.next(true);
    return this.htttpClient
      .get<Post>(BACKEND_URL + "/" + id)
      .pipe(
        catchError((error) => {
          console.log(error);
          return of(null);
        }),
        finalize(() => this.isLoadingSource.next(false)));
  }

  getPosts(postsPerPage: number, pageNamber: number): void {
    this.isLoadingSource.next(true);

    console.log(`?pagesize=${postsPerPage}&page=${pageNamber}`)
    const queryParams = `?pagesize=${postsPerPage}&page=${pageNamber}`;
    this.subs = this.htttpClient
      .get<{ message: string; posts: any[], maxPosts: number }>(BACKEND_URL+queryParams)
      .pipe(
        catchError((error) => {
          console.log(error);
          return of(null);
        }),
        finalize(() => this.isLoadingSource.next(false)))
      .subscribe((res) => {
        console.log(res)
        this.postsUpdated.next(res.posts);
        this.postsCountSource.next(res.maxPosts)
      });
    }

  addPost(title: string, content: string, image: File) {
    this.isLoadingSource.next(true);

    //const post: Post = { _id: null, title, content };

    const postData = new FormData(); // for blob

    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);

    this.htttpClient
      .post<{message: string, post: Post}>(BACKEND_URL, postData)
      .pipe(
        catchError(() => {
          return of(null);
        }),
        finalize(() => this.isLoadingSource.next(false))
      )
      .subscribe(({post}) => {
        const { _id, title, content, imagePath } = post;

        this.postsUpdated.next([...this.postsUpdated.value, { _id, title, content, imagePath } as Post]);

        this.router.navigate(['/']);
      });
  }

  updatePost(_id: string, title: string, content: string, image: File | string): void {
    this.isLoadingSource.next(true);
    let postData: FormData | Post;

    if(typeof(image) === 'object') {
      postData = new FormData(); // for blob

      postData.append("_id", _id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    } else {
      postData = { _id, title, content, imagePath: image as string };
    }
    this.htttpClient
      .put<{ message: string; post: Post }>(
        BACKEND_URL + '/' + _id,
        postData
      )
      .pipe(
        catchError((error) => {
          console.log(error);
          return of(null);
        }),
        finalize(() => this.isLoadingSource.next(false))
      )
      .subscribe(({post}) => {
        const index = this.postsUpdated.value.findIndex(
          (post) => post._id === _id
        );

        const value = this.postsUpdated.value;
        value[index] = post;
        this.postsUpdated.next(value);
      });
  }

  deletePost(postId: string) {
    this.isLoadingSource.next(true);

    return this.htttpClient
      .delete(BACKEND_URL + '/' + postId)
      .pipe(
        catchError((error) => {
          console.log(error);
          return of(null);
        }),
        finalize(() => this.isLoadingSource.next(false))
      );
  }
}
