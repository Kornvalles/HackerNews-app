import { StatusBar } from 'expo-status-bar'
import React, { useState, useEffect } from 'react'
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    ActivityIndicator,
    FlatList,
} from 'react-native'

export default function App() {
    const [isLoading, setLoading] = useState(false)
    const [randomStories, setRandomStories] = useState(Array())

    const API = 'https://hacker-news.firebaseio.com/v0'

    useEffect(() => {
        topTenStories()
    }, [])

    const getStory = async (storyID: string) => {
        const res = await fetch(`${API}/item/${storyID}.json`)
        if (res.ok) {
            return res.json()
        }

        return res.statusText
    }

    const getUser = async (userID: string) => {
        const res = await fetch(`${API}/user/${userID}.json`)
        if (res.ok) {
            return res.json()
        }

        return res.statusText
    }

    const topTenStories = async () => {
        setLoading(true)
        // Fetches top stories from hacker news api
        const res = await fetch(`${API}/topstories.json`)
        // Getting the json from the response
        const topstories = await res.json()
        // Creating an array from the json object
        const topStoriesArr: any[] = Object.values(topstories)
        // Loops 10 times to get 10 items from top stories
        for (let index = 0; index < 10; index++) {
            // Creates random number from 0 to length of top stories
            const randomNumber = Math.floor(
                Math.random() * topStoriesArr.length
            )
            // Gets the id of random top story
            const storyID = topStoriesArr[randomNumber]
            // Pushes the data from chooson top story into returning array
            await getStory(storyID).then((story) => randomStories.push(story))
            // Remove element from array, to not get duplicates
            topStoriesArr.splice(randomNumber, 1)
        }

        const completeList = await addUserToRandomStory(randomStories)

        // Sorting by story score
        setRandomStories(completeList.sort(compare))

        setLoading(false)
    }

    const addUserToRandomStory = async (arr: Array<any>) => {
        const userList = arr.map(
            async (story) =>
                await getUser(story.by).then((user) => {
                    return { ...story, karma: user.karma, authorID: user.id }
                })
        )
        return Promise.all(userList)
    }

    function compare(a: any, b: any) {
        if (a.score < b.score) {
            return -1
        }
        if (a.score > b.score) {
            return 1
        }
        return 0
    }

    const renderItem = ({ item }: any) => {
        return (
            <View
                style={{
                    padding: 5,
                    margin: 20,
                    borderRadius: 4,
                    backgroundColor: 'grey',
                }}
            >
                <Text>{item.title}</Text>
                <Text>{item.url}</Text>
                <Text>{item.time}</Text>
                <Text>{item.score}</Text>
                <Text>{item.authorID}</Text>
                <Text>{item.karma}</Text>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {isLoading ? (
                <ActivityIndicator />
            ) : (
                <FlatList
                    data={randomStories}
                    keyExtractor={({ id }, index) => id}
                    renderItem={renderItem}
                />
            )}
            <StatusBar style="auto" />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
})
