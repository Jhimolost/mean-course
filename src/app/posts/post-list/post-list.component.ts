import { AfterViewChecked, ChangeDetectionStrategy, Component, DoCheck, Input, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { AuthService } from 'src/app/auth/auth.service';
import { Unsubscriber } from 'src/app/unsubscriber';
import { Post } from '../post.model';
import { PostService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostListComponent implements OnInit {
  isLoading$ = this.postService.isLoading$;
  userAuthenticated$ = this.authService.userAuthenticated$;
  posts$: Observable<any[]> = this.postService.postUpdated$;
  postCount$ = this.postService.postCount$;
  userId: string;
  length = 50;
  pageSize = 2;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25];

  constructor(
    private postService: PostService,
    private authService: AuthService) {
  }

  ngOnInit(): void {
   this.initPosts();
   this.userId = this.authService.userId;
  }

  onDelete(postId: string): void {
    this.postService.deletePost(postId).subscribe(() => {this.postService.getPosts(this.pageSize, this.pageIndex+1)});
  }

  onChangedPage(pageData: PageEvent) {
    this.pageIndex = pageData.pageIndex;
    this.pageSize = pageData.pageSize;
    this.initPosts();
  }

  private initPosts(): void {
    this.postService.getPosts(this.pageSize, this.pageIndex+1);
  }
}
