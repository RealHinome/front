<script lang="ts" setup>
export interface Query {
    countries: Array<Country>;
}

export interface Country {
    name: string;
}

const query = gql`
    query {
        countries {
            name
        }
    }
`

const { data } = await useAsyncQuery(query, {});
</script>

<template>
    <p text-2xl ml-4>{{ $t("Hello THERE") }}</p>

    <p pt-2 text-gray-600 dark:text-red-500>{{ $t("There are {number} countries.", { number: data?.countries?.length || 0 }) }}</p>
</template>