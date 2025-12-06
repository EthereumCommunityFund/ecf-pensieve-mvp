import { CaretCircleUpIcon, ChartBarIcon } from '@phosphor-icons/react';

import { Button } from '@/components/base';
import MdEditor from '@/components/base/MdEditor';

import { TopicTag } from '../common/TopicTag';
import { UserAvatar } from '../common/UserAvatar';

export type PostDetailCardProps = {
  isPreviewMode?: boolean;
  title: string;
  author: string;
  authorAvatar?: string | null;
  timeAgo: string;
  contentHtml: string;
  tags: string[];
  categoryLabel: string;
  onAnswer?: () => void;
  onComment?: () => void;
  supportCount?: number;
  hasSupported?: boolean;
  supportPending?: boolean;
  withdrawPending?: boolean;
  onSupportThread?: () => void;
  onWithdrawThread?: () => void;
};

export const serializeEditorValue = (html: string) =>
  JSON.stringify({ content: html, type: 'doc', isEmpty: !html.trim() });

export default function PostDetailCard({
  isPreviewMode,
  title,
  author,
  timeAgo,
  contentHtml,
  tags,
  categoryLabel,
  onAnswer,
  onComment,
  supportCount = 0,
  hasSupported = false,
  supportPending = false,
  withdrawPending = false,
  onSupportThread,
  onWithdrawThread,
  authorAvatar,
}: PostDetailCardProps) {
  return (
    <article className="flex flex-col gap-[20px] rounded-[16px]">
      <TopicTag
        label={categoryLabel}
        className="inline-flex w-fit bg-[#EBEBEB]"
      />
      <div className="flex flex-col gap-[14px]">
        <h1 className="leading-1 text-[20px] font-[500] text-black">{title}</h1>
        <div className=" flex items-center gap-[10px] text-[12px] text-black">
          <span className="text-black/50">BY:</span>
          <div className="flex items-center gap-[5px]">
            <UserAvatar name={author} src={authorAvatar} size={24} />
            <span className="text-[14px]">{author}</span>
          </div>
          <span className=" text-black/60">{timeAgo}</span>
        </div>
      </div>
      <MdEditor
        value={serializeEditorValue(contentHtml)}
        isEdit={false}
        hideMenuBar
        className={{
          base: 'border-none bg-transparent',
          editorWrapper: 'p-0',
          editor: 'prose prose-base max-w-none text-black/80',
        }}
      />
      <div className="flex flex-wrap items-center gap-[10px] text-[14px] text-black/60">
        <span className="font-semibold text-black/50">Tags:</span>
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-[6px] bg-black/5 px-[10px] py-[5px] text-xs font-[600] text-black"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex gap-[10px] border-t border-black/10 pt-4 ">
        {/*  TODO：Thread 维度的情绪投票组件 */}
        <Button className="h-[38px] gap-[10px] rounded-[8px] border-none bg-[#EBEBEB] px-[8px] py-[4px]">
          <ChartBarIcon weight="fill" size={30} className="opacity-30" />
          <span className="text-[12px] font-semibold text-black/60">000</span>
        </Button>
        <Button
          className={`h-[38px] gap-[10px] rounded-[8px] border-none px-[10px] py-[6px] ${
            hasSupported
              ? 'bg-black text-white hover:bg-black/80'
              : 'bg-[#EBEBEB] text-black'
          }`}
          isDisabled={
            isPreviewMode ||
            supportPending ||
            withdrawPending ||
            (!hasSupported && !onSupportThread) ||
            (hasSupported && !onWithdrawThread)
          }
          isLoading={supportPending || withdrawPending}
          onPress={() => {
            const action = hasSupported ? onWithdrawThread : onSupportThread;
            action?.();
          }}
        >
          <CaretCircleUpIcon
            weight="fill"
            size={30}
            className={hasSupported ? 'opacity-100' : 'opacity-30'}
          />

          <span
            className={`text-[13px] font-semibold ${
              hasSupported ? 'text-white' : 'text-black/80'
            }`}
          >
            {supportCount.toLocaleString()}
          </span>
        </Button>
      </div>
      {/* TODO 非 preview 模式，未登录的情况下展示登录按钮，不显示 action 按钮 */}
      <div className="flex flex-col gap-3">
        <Button
          className="w-full rounded-[6px] bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-black/80"
          isDisabled={isPreviewMode}
          onPress={onAnswer}
        >
          Answer This Question
        </Button>
        <Button
          className="w-full rounded-[6px] border border-black/10 px-4 py-3 text-sm font-semibold text-black/70"
          isDisabled={isPreviewMode}
          onPress={onComment}
        >
          Post Comment
        </Button>
      </div>
    </article>
  );
}
