import { baseApi } from "./baseApi"

export const videoSessionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveVideoSessions: builder.query({
      query: () => "/video-sessions/active",
      providesTags: ["VideoSessions"],
    }),
    getVideoSessionById: builder.query({
      query: (id) => `/video-sessions/${id}`,
      providesTags: (result, error, id) => [{ type: "VideoSessions", id }],
    }),
    createVideoSession: builder.mutation({
      query: (body) => ({
        url: "/video-sessions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["VideoSessions", "Rooms"],
    }),
    joinVideoSession: builder.mutation({
      query: (id) => ({
        url: `/video-sessions/${id}/participants`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "VideoSessions", id },
        "Rooms",
      ],
    }),
    leaveVideoSession: builder.mutation({
      query: (id) => ({
        url: `/video-sessions/${id}/participants`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "VideoSessions", id },
        "Rooms",
      ],
    }),
    endVideoSession: builder.mutation({
      query: (id) => ({
        url: `/video-sessions/${id}/end`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "VideoSessions", id },
        "Rooms",
      ],
    }),
    getLivekitToken: builder.mutation({
      query: ({ roomId, roomName, participantIdentity, participantName }) => ({
        url: "/livekit/token",
        method: "POST",
        body: { roomId, roomName, participantIdentity, participantName },
      }),
    }),
  }),
})

export const {
  useGetActiveVideoSessionsQuery,
  useGetVideoSessionByIdQuery,
  useCreateVideoSessionMutation,
  useJoinVideoSessionMutation,
  useLeaveVideoSessionMutation,
  useEndVideoSessionMutation,
  useGetLivekitTokenMutation,
} = videoSessionsApi
