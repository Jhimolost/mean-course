import { ConditionalExpr } from '@angular/compiler';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { Post } from '../post.model';
import { PostService } from '../posts.service';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostCreateComponent implements OnInit {
  isLoading$ = this.postService.isLoading$;
  private postId?: string;
  form: FormGroup;
  imagePreview: string;

  constructor(
    private postService: PostService,
    private activatedRoute: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      _id: new FormControl(null),
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      content: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      image: new FormControl(null, {
        validators: [Validators.required], asyncValidators: [mimeType]
      }),
    });

    this.activatedRoute.paramMap.pipe(
      switchMap((paramMap: ParamMap) => {
        if (paramMap.has('postId')) {
          this.postId = paramMap.get('postId');
          return this.postService.getPost(this.postId)
        }

        return of(null);
      })
    ).subscribe((post) => {
      if(post) {
        const { _id, title, content, imagePath: image } = post;

        this.form.setValue({
          _id,
          title,
          content,
          image
        });

        this.imagePreview = image;
      }
    })

  }

  onAddPost(): void {
    const { _id, title, content, image } = this.form.getRawValue();

    if (_id) {
      this.postService.updatePost(
        _id,
        title,
        content,
        image
      );
    } else {
      this.postService.addPost(title, content, image);
    }
    this.form.reset();
  }

  getControl(control: string): AbstractControl {
    return this.form.get(control);
  }

  fileUploaded(even: Event) {
    const image = (even.target as HTMLInputElement).files[0];

    this.form.patchValue({
      image
    });

    this.getControl('image').updateValueAndValidity();

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.cd.detectChanges();
    };
    reader.readAsDataURL(image);
  }
}
