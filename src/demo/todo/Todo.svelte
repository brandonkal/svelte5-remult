<script lang="ts">
	import { repo } from 'remult'
	import { Module } from './entities'
	import Tile from '../Tile.svelte'

	let formError = $state('')

	let tasks: Module[] = $state([])
	let hideCompleted = $state(false)
	function toggleHideCompleted() {
		hideCompleted = !hideCompleted
	}

	$effect(() => {
		repo(Module)
			.find({
				where: {
					completed: hideCompleted ? false : undefined,
				},
				orderBy: {
					createdAt: 'desc',
				},
			})
			.then((_tasks) => {
				tasks = _tasks
			})
	})

	// let newModuleTitle = $state('')
	let editingModule = $state(new Module())

	let formHasEmpty = $derived(
		//@ts-ignore -- TypeScript is being weird
		!editingModule || editingModule.url.length === 0
	)

	const addModule = async (event: Event) => {
		event.preventDefault()
		try {
			const newModule = await repo(Module).insert(editingModule)
			tasks = [...tasks, newModule]
			editingModule = new Module()
			formError = ''
		} catch (error) {
			formError = (error as { message: string }).message
		}
	}

	const setCompleted = async (task: Module, completed: boolean) => {
		return await repo(Module).update(task.id, { completed })
	}

	const deleteModule = async (task: Module) => {
		await repo(Module).delete(task)
		tasks = tasks.filter((c) => c.id !== task.id)
	}
</script>

<Tile
	title="Todos"
	subtitle="Enter a URL"
	icon=""
	width="full"
	className="todo"
	status="Info"
>
	<main>
		<form onsubmit={addModule}>
			<input
				bind:value={editingModule.url}
				placeholder="What needs to be done?"
				type="text"
			/>
			<button type="submit" disabled={formHasEmpty}>
				<img src="plus.svg" alt="Add" />
			</button>
		</form>
		{#if formError.length > 0}
			{formError}
		{/if}
		{#each tasks as task, i}
			<div class="todo__task {task.completed ? 'completed' : ''}">
				<input
					id={task.id}
					type="checkbox"
					bind:checked={task.completed}
					oninput={async (e) => {
						tasks[i] = await setCompleted(task, e.currentTarget.checked)
					}}
				/>
				<span>
					<label for={task.id}>{task.url}</label>
				</span>
				<button onclick={() => deleteModule(task)}>
					<img src="trash.svg" alt="Delete" />
				</button>
			</div>
		{/each}
	</main>
	<div class="button-row">
		<button onclick={toggleHideCompleted}>
			{hideCompleted ? 'Show' : 'Hide'} completed
		</button>
	</div>
</Tile>
