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
		return repo(Module)
			.liveQuery({
				where: {
					completed: hideCompleted ? false : undefined,
				},
				orderBy: {
					createdAt: 'desc',
				},
			})
			.subscribe((info) => {
				tasks = info.applyChanges(tasks)
			})
	})

	// let newModuleTitle = $state('')
	let editingModule = $state({ ...new Module() })

	let formHasEmpty = $derived(!editingModule || editingModule.url.length === 0)

	function isErrorWithMessage(error: unknown): error is { message: string } {
		return (
			typeof error === 'object' &&
			error !== null &&
			'message' in error &&
			typeof (error as { message: unknown }).message === 'string'
		)
	}

	const addModule = async (event: Event) => {
		event.preventDefault()
		try {
			if (editingModule.id) {
				const modRef = tasks.find((m) => m.id === editingModule.id)
				await repo(Module).update(modRef || editingModule, editingModule)
				editingModule = { ...new Module() }
				formError = ''
			} else {
				await repo(Module).insert(editingModule)
				editingModule = { ...new Module() }
				formError = ''
			}
		} catch (error) {
			if (typeof error === 'string') {
				formError = error
			} else if (isErrorWithMessage(error)) {
				formError = error.message
			} else {
				formError = 'An unknown error occurred'
			}
		}
	}

	const setCompleted = async (task: Module, completed: boolean) => {
		return await repo(Module).update(task, { completed })
	}

	const editModule = async (mod: Module) => {
		editingModule = { ...mod } // This is what causes the client to always perform a PUT even if URL is invalid!
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
					checked={task.completed}
					oninput={async (e) => {
						tasks[i] = await setCompleted(task, e.currentTarget.checked)
					}}
				/>
				<span>
					<label for={task.id}>{task.url}</label>
				</span>
				<button onclick={() => editModule(task)}> Edit </button>
			</div>
		{/each}
	</main>
	<div class="button-row">
		<button onclick={toggleHideCompleted}>
			{hideCompleted ? 'Show' : 'Hide'} completed
		</button>
	</div>
</Tile>
